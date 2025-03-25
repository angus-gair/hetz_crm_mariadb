import { Resolver, Query, Mutation, Arg, ObjectType, Field } from "type-graphql";
import { SuiteCRMConnection, ModuleData, ModuleRecord, ModuleField, APIResult } from "./types";
import { suiteCRMService } from "../services/suitecrm";
import { GraphQLJSON } from 'graphql-type-json';

@Resolver()
export class SuiteCRMResolver {

  @Query(() => SuiteCRMConnection)
  async testSuiteCRMConnection(): Promise<SuiteCRMConnection> {
    try {
      console.log('Testing SuiteCRM connection with updated service method');
      
      // Use the enhanced testConnection method that now returns detailed endpoint status
      const connectionResult = await suiteCRMService.testConnection();
      
      console.log('Connection test results:', connectionResult);
      
      return new SuiteCRMConnection(
        connectionResult.success,
        connectionResult.message || 'Connection test completed',
        connectionResult.endpoints || []
      );
    } catch (error: any) {
      console.error('Connection test failed with error:', error.message);
      return new SuiteCRMConnection(
        false,
        `Connection test error: ${error.message}`,
        []
      );
    }
  }

  @Query(() => ModuleData)
  async getSuiteCRMModules(): Promise<ModuleData> {
    try {
      const modulesData = await suiteCRMService.getModules();
      return {
        success: true,
        data: modulesData
      };
    } catch (error: any) {
      console.error('Failed to get SuiteCRM modules:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Query(() => ModuleField)
  async getSuiteCRMModuleFields(@Arg("moduleName", () => String) moduleName: string): Promise<ModuleField> {
    try {
      const fieldsData = await suiteCRMService.getModuleFields(moduleName);
      return {
        success: true,
        moduleName,
        data: fieldsData
      };
    } catch (error: any) {
      console.error(`Failed to get fields for module ${moduleName}:`, error.message);
      return {
        success: false,
        moduleName,
        error: error.message
      };
    }
  }

  @Query(() => ModuleRecord)
  async getSuiteCRMModuleRecords(
    @Arg("moduleName", () => String) moduleName: string,
    @Arg("page", () => Number, { nullable: true }) page?: number,
    @Arg("size", () => Number, { nullable: true }) size?: number,
    @Arg("filter", () => String, { nullable: true }) filter?: string
  ): Promise<ModuleRecord> {
    try {
      const recordsData = await suiteCRMService.getModuleRecords(moduleName, { page, size, filter });
      return {
        success: true,
        moduleName,
        data: recordsData
      };
    } catch (error: any) {
      console.error(`Failed to get records for module ${moduleName}:`, error.message);
      return {
        success: false,
        moduleName,
        error: error.message
      };
    }
  }

  @Mutation(() => Boolean)
  async createSuiteCRMContact(
    @Arg("firstName", () => String) firstName: string,
    @Arg("lastName", () => String) lastName: string,
    @Arg("email", () => String) email: string,
    @Arg("phone", () => String, { nullable: true }) phone?: string,
    @Arg("message", () => String, { nullable: true }) message?: string
  ): Promise<boolean> {
    try {
      const result = await suiteCRMService.createContact({
        firstName,
        lastName,
        email,
        phone,
        message
      });
      return result.success;
    } catch (error) {
      console.error('Failed to create contact via GraphQL:', error);
      return false;
    }
  }

  @Mutation(() => Boolean)
  async createSuiteCRMConsultation(
    @Arg("name", () => String) name: string,
    @Arg("email", () => String) email: string,
    @Arg("phone", () => String) phone: string,
    @Arg("notes", () => String, { nullable: true }) notes?: string,
    @Arg("preferredDate", () => String, { nullable: true }) preferredDate?: string,
    @Arg("preferredTime", () => String, { nullable: true }) preferredTime?: string
  ): Promise<boolean> {
    try {
      const result = await suiteCRMService.createConsultationMeeting({
        name,
        email,
        phone,
        notes,
        preferredDate,
        preferredTime
      });
      return result.success;
    } catch (error) {
      console.error('Failed to create consultation via GraphQL:', error);
      return false;
    }
  }

  // GraphQL API specific methods
  @Query(() => APIResult)
  async getModuleRecordsWithGraphQL(
    @Arg("module", () => String) module: string,
    @Arg("limit", () => Number, { nullable: true }) limit?: number,
    @Arg("offset", () => Number, { nullable: true }) offset?: number
  ): Promise<APIResult> {
    try {
      console.log(`Getting ${module} records using GraphQL API...`);
      const result = await suiteCRMService.getRecordsWithGraphQL(module, limit, offset);
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      console.error(`Failed to get ${module} records via GraphQL API:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Mutation(() => APIResult)
  async createRecordWithGraphQL(
    @Arg("module", () => String) module: string,
    @Arg("attributes", () => GraphQLJSON) attributes: Record<string, any>
  ): Promise<APIResult> {
    try {
      console.log(`Creating ${module} record using GraphQL API...`);
      const result = await suiteCRMService.createRecordWithGraphQL(module, attributes);
      return {
        success: true,
        message: `Successfully created ${module} record`,
        data: result
      };
    } catch (error: any) {
      console.error(`Failed to create ${module} record via GraphQL API:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Query(() => APIResult)
  async executeCustomGraphQLQuery(
    @Arg("query", () => String) query: string,
    @Arg("variables", () => GraphQLJSON, { nullable: true }) variables?: any
  ): Promise<APIResult> {
    try {
      console.log('Executing custom GraphQL query...');
      const result = await suiteCRMService.executeGraphQLQuery(query, variables);
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      console.error('Failed to execute custom GraphQL query:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}