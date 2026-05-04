const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const projectRoot = path.resolve(__dirname, '..');
const srcRoot = path.join(projectRoot, 'src');
const outputPath = path.join(projectRoot, 'docs', 'swagger.json');

const HTTP_DECORATORS = new Map([
  ['Get', 'get'],
  ['Post', 'post'],
  ['Put', 'put'],
  ['Patch', 'patch'],
  ['Delete', 'delete'],
]);

const HTTP_STATUS_MAP = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
};

function main() {
  const program = createProgram();
  const checker = program.getTypeChecker();
  const state = {
    checker,
    components: {},
    componentKeys: new Map(),
    componentNames: new Map(),
    buildingComponents: new Set(),
  };

  const controllers = collectControllers(program);
  const paths = {};
  const tags = [];
  const seenTags = new Set();

  for (const controller of controllers) {
    const tagName = buildTagName(controller);
    if (!seenTags.has(tagName)) {
      seenTags.add(tagName);
      tags.push({ name: tagName });
    }

    for (const method of controller.methods) {
      const operation = buildOperation(method, tagName, state);
      if (!paths[method.path]) {
        paths[method.path] = {};
      }
      paths[method.path][method.httpMethod] = operation;
    }
  }

  const document = {
    openapi: '3.0.3',
    info: {
      title: 'Stock Overflow API',
      version: '1.0.0',
      description:
        'Swagger documentation generated from the implemented NestJS controllers, DTOs, and TypeScript response types.',
    },
    servers: [
      {
        url: '/api',
        description: 'Application API base path',
      },
    ],
    tags,
    paths,
    components: {
      parameters: {
        RoleHeader: {
          name: 'role',
          in: 'header',
          required: false,
          description:
            'Caller role context for this API. Supported values include `admin`, `retailer`, `supplier`, `consumer`, and `biller`.',
          schema: {
            type: 'string',
            enum: ['admin', 'retailer', 'supplier', 'consumer', 'biller'],
          },
        },
      },
      schemas: sortObject(state.components),
    },
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
  process.stdout.write(`Swagger document generated at ${outputPath}\n`);
}

function createProgram() {
  const configPath = ts.findConfigFile(projectRoot, ts.sys.fileExists, 'tsconfig.json');
  if (!configPath) {
    throw new Error('Unable to locate tsconfig.json for Swagger generation.');
  }

  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  if (configFile.error) {
    throw new Error(formatDiagnostic(configFile.error));
  }

  const parsed = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(configPath),
  );
  return ts.createProgram({
    rootNames: parsed.fileNames,
    options: parsed.options,
  });
}

function collectControllers(program) {
  const controllers = [];
  for (const sourceFile of program.getSourceFiles()) {
    if (!isProjectSourceFile(sourceFile.fileName)) {
      continue;
    }
    ts.forEachChild(sourceFile, (node) => {
      if (!ts.isClassDeclaration(node) || !node.name) {
        return;
      }

      const controllerDecorator = getDecorators(node).find(
        (decorator) => getDecoratorName(decorator) === 'Controller',
      );
      if (!controllerDecorator) {
        return;
      }

      const controllerPath = getDecoratorStringArgument(controllerDecorator) || '';
      const methods = node.members
        .filter((member) => ts.isMethodDeclaration(member))
        .map((member) => buildControllerMethod(member, controllerPath))
        .filter(Boolean);

      controllers.push({
        classNode: node,
        controllerPath,
        methods,
      });
    });
  }
  return controllers;
}

function buildControllerMethod(methodNode, controllerPath) {
  const httpDecorator = getDecorators(methodNode).find((decorator) =>
    HTTP_DECORATORS.has(getDecoratorName(decorator)),
  );
  if (!httpDecorator) {
    return null;
  }

  const httpMethod = HTTP_DECORATORS.get(getDecoratorName(httpDecorator));
  const routePath = getDecoratorStringArgument(httpDecorator) || '';

  return {
    node: methodNode,
    httpMethod,
    path: buildOpenApiPath(controllerPath, routePath),
    routePath,
    statusCode: resolveStatusCode(methodNode, httpMethod),
  };
}

function buildOperation(method, tagName, state) {
  const checker = state.checker;
  const parameters = [{ $ref: '#/components/parameters/RoleHeader' }];
  let requestBody;

  for (const parameter of method.node.parameters) {
    const decoratorInfos = getParameterDecoratorInfos(parameter);
    for (const info of decoratorInfos) {
      if (info.kind === 'body') {
        requestBody = buildRequestBody(parameter, state);
        continue;
      }
      if (info.kind === 'query' || info.kind === 'path') {
        parameters.push(buildParameter(parameter, info, state));
      }
    }
  }

  const signature = checker.getSignatureFromDeclaration(method.node);
  const returnType = signature
    ? checker.getReturnTypeOfSignature(signature)
    : checker.getTypeAtLocation(method.node);

  const responses = {
    [String(method.statusCode)]: buildSuccessResponse(returnType, method.statusCode, state),
    400: {
      description: 'Bad Request',
    },
  };

  if (parameters.some((parameter) => parameter.in === 'path')) {
    responses[404] = {
      description: 'Resource not found',
    };
  }

  const operation = {
    tags: [tagName],
    operationId: `${tagName}_${method.node.name.getText()}`,
    summary: humanizeIdentifier(method.node.name.getText()),
    parameters,
    responses,
  };

  if (requestBody) {
    operation.requestBody = requestBody;
  }

  return operation;
}

function buildRequestBody(parameter, state) {
  const type = state.checker.getTypeAtLocation(parameter);
  return {
    required: !Boolean(parameter.questionToken),
    content: {
      'application/json': {
        schema: schemaForType(type, state),
      },
    },
  };
}

function buildParameter(parameter, info, state) {
  const checker = state.checker;
  const type = checker.getTypeAtLocation(parameter);
  const schema = schemaForType(type, state, { preferInline: true });

  return {
    name: info.name,
    in: info.kind === 'path' ? 'path' : 'query',
    required: info.kind === 'path' ? true : !Boolean(parameter.questionToken),
    description:
      info.kind === 'path'
        ? `Path parameter: ${info.name}`
        : `Query parameter: ${info.name}`,
    schema,
  };
}

function buildSuccessResponse(returnType, statusCode, state) {
  if (statusCode === 204 || isVoidLike(returnType)) {
    return {
      description: 'No Content',
    };
  }

  return {
    description: 'Successful response',
    content: {
      'application/json': {
        schema: schemaForType(returnType, state),
      },
    },
  };
}

function schemaForType(type, state, options = {}) {
  if (!type) {
    return {};
  }

  const schema = buildSchema(type, state, options);
  return sortObject(schema);
}

function buildSchema(type, state, options = {}) {
  const checker = state.checker;

  if (isAnyOrUnknown(type)) {
    return {};
  }

  if (!options.preferInline) {
    const ref = buildComponentReference(type, state);
    if (ref) {
      return ref;
    }
  }

  if (isStringLiteralType(type)) {
    return { type: 'string', enum: [type.value] };
  }

  if (isStringType(type)) {
    return { type: 'string' };
  }

  if (isNumberLiteralType(type)) {
    return { type: Number.isInteger(type.value) ? 'integer' : 'number', enum: [type.value] };
  }

  if (isNumberType(type)) {
    return { type: 'number' };
  }

  if (isBooleanType(type)) {
    return { type: 'boolean' };
  }

  if (isBooleanLiteralType(type)) {
    return { type: 'boolean', enum: [type.intrinsicName === 'true'] };
  }

  if (type.flags & ts.TypeFlags.BigIntLike) {
    return { type: 'integer' };
  }

  if (isDateType(type)) {
    return { type: 'string', format: 'date-time' };
  }

  if (type.isUnion()) {
    return buildUnionSchema(type, state, options);
  }

  if (checker.isArrayType(type) || checker.isTupleType(type)) {
    return buildArraySchema(type, state, options);
  }

  const enumSchema = buildEnumSchema(type, state);
  if (enumSchema) {
    return enumSchema;
  }

  if (type.flags & ts.TypeFlags.Object) {
    return buildObjectSchema(type, state, options);
  }

  return {};
}

function buildUnionSchema(type, state, options) {
  const unionTypes = type.types.filter((entry) => !isUndefinedType(entry));
  const hasNull = type.types.some((entry) => isNullType(entry));

  if (unionTypes.length === 1) {
    const schema = buildSchema(unionTypes[0], state, options);
    if (hasNull) {
      schema.nullable = true;
    }
    return schema;
  }

  const literalStrings = unionTypes.every((entry) => entry.isStringLiteral());
  if (literalStrings) {
    return {
      type: 'string',
      enum: unionTypes.map((entry) => entry.value),
      ...(hasNull ? { nullable: true } : {}),
    };
  }

  const literalNumbers = unionTypes.every(
    (entry) => entry.flags & ts.TypeFlags.NumberLiteral,
  );
  if (literalNumbers) {
    return {
      type: 'number',
      enum: unionTypes.map((entry) => entry.value),
      ...(hasNull ? { nullable: true } : {}),
    };
  }

  const oneOf = unionTypes.map((entry) => buildSchema(entry, state, options));
  return {
    oneOf,
    ...(hasNull ? { nullable: true } : {}),
  };
}

function buildArraySchema(type, state, options) {
  const checker = state.checker;
  const typeArguments = checker.getTypeArguments(type);
  const itemType = typeArguments[0] || checker.getAnyType();
  return {
    type: 'array',
    items: buildSchema(itemType, state, options),
  };
}

function buildEnumSchema(type, state) {
  const declaration = getEnumDeclaration(type);
  if (!declaration) {
    return null;
  }

  const values = declaration.members
    .map((member) => enumMemberValue(member))
    .filter((value) => value !== undefined);
  if (!values.length) {
    return null;
  }

  const stringEnum = values.every((value) => typeof value === 'string');
  return {
    type: stringEnum ? 'string' : 'number',
    enum: values,
  };
}

function buildObjectSchema(type, state, options) {
  const checker = state.checker;
  const stringIndexType = checker.getIndexTypeOfType(type, ts.IndexKind.String);
  const properties = checker.getPropertiesOfType(type).filter((symbol) => {
    const name = symbol.getName();
    return name !== '__index' && name !== 'prototype';
  });

  if (!properties.length && stringIndexType) {
    return {
      type: 'object',
      additionalProperties: buildSchema(stringIndexType, state, options),
    };
  }

  if (!properties.length) {
    return {
      type: 'object',
      additionalProperties: true,
    };
  }

  const objectSchema = {
    type: 'object',
    properties: {},
  };

  const required = [];
  for (const property of properties) {
    const propertyDeclaration = property.valueDeclaration || property.declarations?.[0];
    const propertyType = checker.getTypeOfSymbolAtLocation(
      property,
      propertyDeclaration || type.symbol?.valueDeclaration || propertyDeclaration,
    );
    const propertySchema = buildSchema(propertyType, state, options);
    const metadata = propertyDeclaration
      ? getPropertyDecoratorMetadata(propertyDeclaration, state)
      : {};

    objectSchema.properties[property.getName()] = mergeSchemas(propertySchema, metadata.schema);
    if (isPropertyRequired(property, propertyType, metadata)) {
      required.push(property.getName());
    }
  }

  if (stringIndexType) {
    objectSchema.additionalProperties = buildSchema(stringIndexType, state, options);
  }

  if (required.length) {
    objectSchema.required = required.sort();
  }

  return objectSchema;
}

function buildComponentReference(type, state) {
  const componentKey = getReusableTypeKey(type);
  if (!componentKey) {
    return null;
  }

  let componentName = state.componentNames.get(componentKey);
  if (!componentName) {
    componentName = buildComponentName(componentKey);
    state.componentNames.set(componentKey, componentName);
  }

  if (!state.componentKeys.has(componentKey)) {
    state.componentKeys.set(componentKey, componentName);
  }

  if (!state.components[componentName] && !state.buildingComponents.has(componentKey)) {
    state.buildingComponents.add(componentKey);
    state.components[componentName] = {};
    const schema = buildSchema(type, state, { preferInline: true });
    state.components[componentName] = schema;
    state.buildingComponents.delete(componentKey);
  }

  return { $ref: `#/components/schemas/${componentName}` };
}

function getReusableTypeKey(type) {
  const symbol = getPrimarySymbol(type);
  if (!symbol) {
    return null;
  }

  const declaration = symbol.valueDeclaration || symbol.declarations?.[0];
  if (!declaration) {
    return null;
  }

  if (!isProjectSourceFile(declaration.getSourceFile().fileName)) {
    return null;
  }

  const symbolName = symbol.getName();
  if (!symbolName || symbolName.startsWith('__') || symbolName === 'Array') {
    return null;
  }

  if (
    !ts.isClassDeclaration(declaration) &&
    !ts.isInterfaceDeclaration(declaration) &&
    !ts.isTypeAliasDeclaration(declaration) &&
    !ts.isEnumDeclaration(declaration)
  ) {
    return null;
  }

  const relativePath = path
    .relative(srcRoot, declaration.getSourceFile().fileName)
    .replace(/\\/g, '/')
    .replace(/\.ts$/, '');
  return `${relativePath}:${symbolName}`;
}

function buildComponentName(componentKey) {
  return componentKey
    .replace(/^src\//, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function getPrimarySymbol(type) {
  return type.aliasSymbol || type.getSymbol() || null;
}

function getEnumDeclaration(type) {
  const symbol = getPrimarySymbol(type);
  if (!symbol) {
    return null;
  }
  return (symbol.declarations || []).find((declaration) =>
    ts.isEnumDeclaration(declaration),
  );
}

function enumMemberValue(member) {
  if (!member.initializer) {
    return member.name.getText();
  }
  if (ts.isStringLiteral(member.initializer) || ts.isNoSubstitutionTemplateLiteral(member.initializer)) {
    return member.initializer.text;
  }
  if (ts.isNumericLiteral(member.initializer)) {
    return Number(member.initializer.text);
  }
  return member.name.getText();
}

function isPropertyRequired(symbol, propertyType, metadata) {
  if (metadata.optional === true) {
    return false;
  }

  if (symbol.flags & ts.SymbolFlags.Optional) {
    return false;
  }

  if (propertyType.isUnion() && propertyType.types.some((entry) => isUndefinedType(entry))) {
    return false;
  }

  const declaration = symbol.valueDeclaration || symbol.declarations?.[0];
  if (
    declaration &&
    (ts.isPropertyDeclaration(declaration) || ts.isPropertySignature(declaration)) &&
    declaration.questionToken
  ) {
    return false;
  }

  return true;
}

function getPropertyDecoratorMetadata(declaration, state) {
  const metadata = {
    optional: undefined,
    schema: {},
  };

  for (const decorator of getDecorators(declaration)) {
    const name = getDecoratorName(decorator);
    const callExpression = getDecoratorCallExpression(decorator);
    const firstArgument = callExpression?.arguments?.[0];

    switch (name) {
      case 'IsOptional':
        metadata.optional = true;
        break;
      case 'IsEmail':
        metadata.schema.type = 'string';
        metadata.schema.format = 'email';
        break;
      case 'IsUrl':
        metadata.schema.type = 'string';
        metadata.schema.format = 'uri';
        break;
      case 'IsDateString':
        metadata.schema.type = 'string';
        metadata.schema.format = 'date-time';
        break;
      case 'IsInt':
        metadata.schema.type = 'integer';
        break;
      case 'IsNumber':
        metadata.schema.type = 'number';
        break;
      case 'IsBoolean':
        metadata.schema.type = 'boolean';
        break;
      case 'IsArray':
        metadata.schema.type = 'array';
        break;
      case 'IsObject':
        metadata.schema.type = 'object';
        metadata.schema.additionalProperties = true;
        break;
      case 'IsString':
        metadata.schema.type = 'string';
        break;
      case 'Min':
        if (firstArgument && ts.isNumericLiteral(firstArgument)) {
          metadata.schema.minimum = Number(firstArgument.text);
        }
        break;
      case 'Max':
        if (firstArgument && ts.isNumericLiteral(firstArgument)) {
          metadata.schema.maximum = Number(firstArgument.text);
        }
        break;
      case 'MinLength':
        if (firstArgument && ts.isNumericLiteral(firstArgument)) {
          metadata.schema.minLength = Number(firstArgument.text);
        }
        break;
      case 'MaxLength':
        if (firstArgument && ts.isNumericLiteral(firstArgument)) {
          metadata.schema.maxLength = Number(firstArgument.text);
        }
        break;
      case 'ArrayMinSize':
        if (firstArgument && ts.isNumericLiteral(firstArgument)) {
          metadata.schema.minItems = Number(firstArgument.text);
        }
        break;
      case 'ArrayMaxSize':
        if (firstArgument && ts.isNumericLiteral(firstArgument)) {
          metadata.schema.maxItems = Number(firstArgument.text);
        }
        break;
      case 'IsIn':
      case 'IsEnum': {
        const enumValues = resolveDecoratorEnumValues(firstArgument, state);
        if (enumValues.length) {
          metadata.schema.enum = enumValues;
          if (!metadata.schema.type) {
            metadata.schema.type =
              enumValues.every((value) => typeof value === 'number') ? 'number' : 'string';
          }
        }
        break;
      }
      default:
        break;
    }
  }

  return metadata;
}

function resolveDecoratorEnumValues(expression, state) {
  if (!expression) {
    return [];
  }

  if (ts.isArrayLiteralExpression(expression)) {
    return expression.elements
      .map((element) => literalValue(element))
      .filter((value) => value !== undefined);
  }

  const checker = state.checker;
  const type = checker.getTypeAtLocation(expression);

  const enumDeclaration = getEnumDeclaration(type);
  if (enumDeclaration) {
    return enumDeclaration.members
      .map((member) => enumMemberValue(member))
      .filter((value) => value !== undefined);
  }

  if (checker.isArrayType(type) || checker.isTupleType(type)) {
    const typeArguments = checker.getTypeArguments(type);
    const valueType = typeArguments[0];
    if (valueType && valueType.isUnion()) {
      return valueType.types
        .map((entry) => {
          if (entry.isStringLiteral()) {
            return entry.value;
          }
          if (entry.flags & ts.TypeFlags.NumberLiteral) {
            return entry.value;
          }
          return undefined;
        })
        .filter((value) => value !== undefined);
    }
  }

  if (type.isUnion()) {
    return type.types
      .map((entry) => {
        if (entry.isStringLiteral()) {
          return entry.value;
        }
        if (entry.flags & ts.TypeFlags.NumberLiteral) {
          return entry.value;
        }
        return undefined;
      })
      .filter((value) => value !== undefined);
  }

  return [];
}

function literalValue(expression) {
  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
    return expression.text;
  }
  if (ts.isNumericLiteral(expression)) {
    return Number(expression.text);
  }
  if (expression.kind === ts.SyntaxKind.TrueKeyword) {
    return true;
  }
  if (expression.kind === ts.SyntaxKind.FalseKeyword) {
    return false;
  }
  return undefined;
}

function getParameterDecoratorInfos(parameter) {
  return getDecorators(parameter)
    .map((decorator) => {
      const name = getDecoratorName(decorator);
      const callExpression = getDecoratorCallExpression(decorator);
      const decoratorArgument = callExpression?.arguments?.[0];

      if (name === 'Body') {
        return { kind: 'body' };
      }

      if (name === 'Query') {
        return {
          kind: 'query',
          name:
            (decoratorArgument && getExpressionStringValue(decoratorArgument)) ||
            parameter.name.getText(),
        };
      }

      if (name === 'Param') {
        return {
          kind: 'path',
          name:
            (decoratorArgument && getExpressionStringValue(decoratorArgument)) ||
            parameter.name.getText(),
        };
      }

      return null;
    })
    .filter(Boolean);
}

function resolveStatusCode(methodNode, httpMethod) {
  const httpCodeDecorator = getDecorators(methodNode).find(
    (decorator) => getDecoratorName(decorator) === 'HttpCode',
  );
  if (httpCodeDecorator) {
    const callExpression = getDecoratorCallExpression(httpCodeDecorator);
    const firstArgument = callExpression?.arguments?.[0];
    const explicitStatus = resolveStatusLiteral(firstArgument);
    if (explicitStatus) {
      return explicitStatus;
    }
  }

  return httpMethod === 'post' ? 201 : 200;
}

function resolveStatusLiteral(expression) {
  if (!expression) {
    return null;
  }

  if (ts.isNumericLiteral(expression)) {
    return Number(expression.text);
  }

  if (ts.isPropertyAccessExpression(expression)) {
    return HTTP_STATUS_MAP[expression.name.getText()] || null;
  }

  return null;
}

function buildOpenApiPath(controllerPath, routePath) {
  const segments = [controllerPath, routePath]
    .map((segment) => String(segment || '').trim())
    .filter(Boolean)
    .map((segment) => segment.replace(/^\/+|\/+$/g, ''));
  const fullPath = `/${segments.join('/')}`.replace(/\/+/g, '/');
  return fullPath.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
}

function buildTagName(controller) {
  if (controller.classNode.name) {
    return controller.classNode.name.getText().replace(/Controller$/, '');
  }
  return humanizeIdentifier(controller.controllerPath || 'API');
}

function humanizeIdentifier(value) {
  return String(value || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (character) => character.toUpperCase());
}

function getDecoratorStringArgument(decorator) {
  const callExpression = getDecoratorCallExpression(decorator);
  const firstArgument = callExpression?.arguments?.[0];
  return firstArgument ? getExpressionStringValue(firstArgument) : null;
}

function getExpressionStringValue(expression) {
  if (
    ts.isStringLiteral(expression) ||
    ts.isNoSubstitutionTemplateLiteral(expression)
  ) {
    return expression.text;
  }
  return null;
}

function getDecoratorName(decorator) {
  const expression = decorator.expression;
  if (ts.isCallExpression(expression)) {
    return expression.expression.getText();
  }
  return expression.getText();
}

function getDecoratorCallExpression(decorator) {
  return ts.isCallExpression(decorator.expression) ? decorator.expression : null;
}

function getDecorators(node) {
  if (typeof ts.canHaveDecorators === 'function' && ts.canHaveDecorators(node)) {
    return ts.getDecorators(node) || [];
  }
  return node.decorators || [];
}

function isProjectSourceFile(fileName) {
  const normalized = path.normalize(fileName);
  return (
    normalized.startsWith(path.normalize(srcRoot)) &&
    normalized.endsWith('.ts') &&
    !normalized.endsWith('.spec.ts')
  );
}

function formatDiagnostic(diagnostic) {
  return ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
}

function isAnyOrUnknown(type) {
  return Boolean(type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown));
}

function isStringType(type) {
  return Boolean(type.flags & ts.TypeFlags.String);
}

function isNumberType(type) {
  return Boolean(type.flags & ts.TypeFlags.Number);
}

function isStringLiteralType(type) {
  return typeof type.isStringLiteral === 'function' && type.isStringLiteral();
}

function isNumberLiteralType(type) {
  return Boolean(type.flags & ts.TypeFlags.NumberLiteral);
}

function isBooleanType(type) {
  return Boolean(type.flags & ts.TypeFlags.Boolean);
}

function isBooleanLiteralType(type) {
  return (
    type.intrinsicName === 'true' ||
    type.intrinsicName === 'false'
  );
}

function isUndefinedType(type) {
  return Boolean(type.flags & ts.TypeFlags.Undefined);
}

function isNullType(type) {
  return Boolean(type.flags & ts.TypeFlags.Null);
}

function isVoidLike(type) {
  return Boolean(type.flags & (ts.TypeFlags.Void | ts.TypeFlags.Undefined));
}

function isDateType(type) {
  const symbol = getPrimarySymbol(type);
  return Boolean(symbol && symbol.getName() === 'Date');
}

function mergeSchemas(baseSchema, metadataSchema) {
  if (!metadataSchema || !Object.keys(metadataSchema).length) {
    return baseSchema;
  }

  const merged = { ...metadataSchema, ...baseSchema };
  if (!baseSchema.type && metadataSchema.type) {
    merged.type = metadataSchema.type;
  }
  if (baseSchema.type === 'number' && metadataSchema.type === 'integer') {
    merged.type = 'integer';
  }

  return merged;
}

function sortObject(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => sortObject(entry));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.keys(value)
    .sort()
    .reduce((accumulator, key) => {
      accumulator[key] = sortObject(value[key]);
      return accumulator;
    }, {});
}

main();
