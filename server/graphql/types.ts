import { Field, ObjectType, InputType } from "type-graphql";
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class SuiteCRMConnection {
  @Field(() => Boolean)
  success!: boolean;

  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => [EndpointStatus])
  endpoints!: EndpointStatus[];

  constructor(success: boolean, message?: string, endpoints: EndpointStatus[] = []) {
    this.success = success;
    this.message = message;
    this.endpoints = endpoints;
  }
}

@ObjectType()
class EndpointStatus {
  @Field(() => String)
  name!: string;

  @Field(() => Number)
  status!: number;

  @Field(() => String)
  statusText!: string;

  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  data?: any;

  constructor(name: string, status: number, statusText: string, error?: string, data?: any) {
    this.name = name;
    this.status = status;
    this.statusText = statusText;
    this.error = error;
    this.data = data;
  }
}

@ObjectType()
export class ModuleData {
  @Field(() => Boolean)
  success!: boolean;

  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  data?: any;
}

@ObjectType()
export class ModuleField {
  @Field(() => Boolean)
  success!: boolean;

  @Field(() => String)
  moduleName!: string;

  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  data?: any;
}

@ObjectType()
export class ModuleRecord {
  @Field(() => Boolean)
  success!: boolean;

  @Field(() => String)
  moduleName!: string;

  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  data?: any;
}

@InputType()
export class SuiteCRMCredentials {
  @Field(() => String)
  username!: string;

  @Field(() => String)
  password!: string;

  constructor(username: string = '', password: string = '') {
    this.username = username;
    this.password = password;
  }
}

@InputType()
export class ContactInput {
  @Field(() => String)
  firstName!: string;

  @Field(() => String)
  lastName!: string;

  @Field(() => String)
  email!: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => String, { nullable: true })
  message?: string;
}

@InputType()
export class ConsultationInput {
  @Field(() => String)
  name!: string;

  @Field(() => String)
  email!: string;

  @Field(() => String)
  phone!: string;

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => String, { nullable: true })
  preferredDate?: string;

  @Field(() => String, { nullable: true })
  preferredTime?: string;
}