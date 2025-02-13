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