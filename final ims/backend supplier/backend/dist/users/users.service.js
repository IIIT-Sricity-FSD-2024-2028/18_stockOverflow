"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
let UsersService = class UsersService {
    constructor() {
        this.users = [
            { id: 'u-admin-1', name: 'System Administrator', email: 'admin@stockoverflow.com', password: 'pass1234', role: 'admin', status: 'Active', store: 'Global Hub' },
            { id: 'u-retailer-1', name: 'Primary Retailer', email: 'retailer@stockoverflow.com', password: 'pass1234', role: 'retailer', status: 'Active', store: 'Downtown Store' },
            { id: 'u-supplier-1', name: 'Primary Supplier', email: 'supplier@stockoverflow.com', password: 'pass1234', role: 'supplier', status: 'Active', store: 'Global Hub' },
            { id: 'u-consumer-1', name: 'Primary Consumer', email: 'consumer@stockoverflow.com', password: 'pass1234', role: 'consumer', status: 'Active', store: 'Downtown Store' }
        ];
    }
    findAll() {
        return this.users;
    }
    findOne(id) {
        return this.users.find(user => user.id === id);
    }
    create(createUserDto) {
        const existingUser = this.users.find(user => user.email.toLowerCase() === createUserDto.email.toLowerCase());
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        const user = {
            id: Date.now().toString(),
            status: 'Active',
            store: createUserDto.store || (createUserDto.role === 'retailer' ? 'Downtown Store' : 'Global Hub'),
            ...createUserDto,
        };
        this.users.push(user);
        return user;
    }
    update(id, updateUserDto) {
        const index = this.users.findIndex(user => user.id === id);
        if (index > -1) {
            this.users[index] = { ...this.users[index], ...updateUserDto };
            return this.users[index];
        }
        return null;
    }
    remove(id) {
        const index = this.users.findIndex(user => user.id === id);
        if (index > -1) {
            this.users.splice(index, 1);
            return true;
        }
        return false;
    }
    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (user.status !== 'Active') {
            throw new common_1.UnauthorizedException('Account is inactive');
        }
        return user;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)()
], UsersService);
//# sourceMappingURL=users.service.js.map