import { Resolver, Query, Mutation, Arg, ObjectType, Field } from "type-graphql";
import { SuiteCRMConnection, ModuleData, ModuleRecord, ModuleField } from "./types";
import { suiteCRMService } from "../services/suitecrm";
import { GraphQLJSON } from 'graphql-type-json';

@Resolver()
export class SuiteCRMResolver {

  @Query(() => SuiteCRMConnection)
  async testSuiteCRMConnection(): Promise<SuiteCRMConnection> {
    const endpoints = [
      {
        name: 'V8 OAuth Endpoint',
        test: async () => {
          try {
            // This will internally call getValidToken which handles the OAuth process
            const testResult = await suiteCRMService.testConnection();
            return { 
              success: testResult, 
              message: testResult ? 'OAuth token obtained successfully' : 'Failed to obtain OAuth token' 
            };
          } catch (error: any) {
            return { success: false, message: error.message };
          }
        }
      },
      {
        name: 'V8 Modules Endpoint',
        test: async () => {
          try {
            await suiteCRMService.getModules();
            return { success: true, message: 'Modules endpoint accessible' };
          } catch (error: any) {
            return { success: false, message: error.message };
          }
        }
      },
      {
        name: 'V8 Meta Now Endpoint',
        test: async () => {
          try {
            const testResult = await suiteCRMService.testConnection();
            return { 
              success: testResult, 
              message: testResult ? 'Server time endpoint accessible' : 'Failed to access server time endpoint' 
            };
          } catch (error: any) {
            return { success: false, message: error.message };
          }
        }
      }
    ];

    try {
      console.log('Testing SuiteCRM connection');

      const results = await Promise.all(
        endpoints.map(async (endpoint) => {
          const result = await endpoint.test();
          return {
            name: endpoint.name,
            status: result.success ? 200 : 500,
            statusText: result.success ? 'OK' : 'Error',
            data: result,
            error: result.success ? undefined : result.message
          };
        })
      );

      const isSuccessful = results.every(r => r.status === 200);
      const message = isSuccessful ? 
        'All endpoints successful' : 
        'Some endpoints failed: ' + results.filter(r => r.error).map(r => r.name).join(', ');

      return new SuiteCRMConnection(
        isSuccessful,
        message,
        results
      );
    } catch (error: any) {
      console.error('Connection test failed:', error.message);
      return new SuiteCRMConnection(
        false,
        error.message,
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
  async getSuiteCRMModuleFields(@Arg("moduleName") moduleName: string): Promise<ModuleField> {
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
    @Arg("moduleName") moduleName: string,
    @Arg("page", { nullable: true }) page?: number,
    @Arg("size", { nullable: true }) size?: number,
    @Arg("filter", { nullable: true }) filter?: string
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
    @Arg("firstName") firstName: string,
    @Arg("lastName") lastName: string,
    @Arg("email") email: string,
    @Arg("phone", { nullable: true }) phone?: string,
    @Arg("message", { nullable: true }) message?: string
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
    @Arg("name") name: string,
    @Arg("email") email: string,
    @Arg("phone") phone: string,
    @Arg("notes", { nullable: true }) notes?: string,
    @Arg("preferredDate", { nullable: true }) preferredDate?: string,
    @Arg("preferredTime", { nullable: true }) preferredTime?: string
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
}