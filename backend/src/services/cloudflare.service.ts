import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../config';
import { logger } from './logger.service';

interface CloudflareResponse<T> {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: string[];
  result: T;
}

interface CloudflareErrorResponse {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
}

const CF_ERROR_MESSAGES: Record<number, string> = {
  1000: 'Невалідний запит',
  1001: 'Невалідний метод',
  1002: 'Невалідний URI',
  1003: 'Невалідний домен',
  1004: 'Домен вже існує в Cloudflare',
  1006: 'Невалідний API токен',
  1007: 'Невалідний акаунт',
  1049: 'Домен не знайдено',
  1061: 'Домен заблоковано',
  6003: 'Невалідна зона',
  6103: 'Невалідний DNS запис',
  7000: 'Перевищено ліміт запитів',
  7003: 'Немає доступу до цього ресурсу',
  9103: 'DNS запис вже існує',
  10000: 'Помилка авторизації',
};

function parseCloudflareError(error: AxiosError<CloudflareErrorResponse>): string {
  if (error.response?.data?.errors?.length) {
    const cfErrors = error.response.data.errors;
    return cfErrors
      .map((e) => CF_ERROR_MESSAGES[e.code] || e.message)
      .join('; ');
  }

  if (error.response?.status === 400) {
    return 'Невалідний запит. Перевірте правильність домену або параметрів.';
  }
  if (error.response?.status === 401) {
    return 'Помилка авторизації. Перевірте Cloudflare API токен.';
  }
  if (error.response?.status === 403) {
    return 'Немає доступу. Перевірте права API токену.';
  }
  if (error.response?.status === 404) {
    return 'Ресурс не знайдено.';
  }
  if (error.response?.status === 429) {
    return 'Забагато запитів. Спробуйте пізніше.';
  }

  return error.message || 'Невідома помилка Cloudflare API';
}

interface Zone {
  id: string;
  name: string;
  status: string;
  name_servers: string[];
}

interface DNSRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl: number;
  proxied: boolean;
}

class CloudflareService {
  private getClient(): AxiosInstance {
    return axios.create({
      baseURL: 'https://api.cloudflare.com/client/v4',
      headers: {
        Authorization: `Bearer ${config.cloudflare.apiToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async createZone(domainName: string): Promise<Zone> {
    try {
      const response = await this.getClient().post<CloudflareResponse<Zone>>('/zones', {
        name: domainName,
        account: { id: config.cloudflare.accountId },
        jump_start: true,
      });

      if (!response.data.success) {
        const errorMsg = response.data.errors.map((e) => CF_ERROR_MESSAGES[e.code] || e.message).join('; ');
        throw new Error(errorMsg);
      }

      logger.info(`Zone created: ${domainName}`, 'Cloudflare');
      return response.data.result;
    } catch (error) {
      const message = parseCloudflareError(error as AxiosError<CloudflareErrorResponse>);
      logger.error(`Failed to create zone ${domainName}: ${message}`, 'Cloudflare');
      throw new Error(message);
    }
  }

  async getZone(zoneId: string): Promise<Zone> {
    try {
      const response = await this.getClient().get<CloudflareResponse<Zone>>(`/zones/${zoneId}`);
      if (!response.data.success) {
        throw new Error(response.data.errors.map((e) => e.message).join('; '));
      }
      return response.data.result;
    } catch (error) {
      const message = parseCloudflareError(error as AxiosError<CloudflareErrorResponse>);
      logger.error(`Failed to get zone ${zoneId}: ${message}`, 'Cloudflare');
      throw new Error(message);
    }
  }

  async getZoneByName(domainName: string): Promise<Zone | null> {
    try {
      const response = await this.getClient().get<CloudflareResponse<Zone[]>>('/zones', {
        params: { name: domainName },
      });
      if (!response.data.success) {
        throw new Error(response.data.errors.map((e) => e.message).join('; '));
      }
      return response.data.result[0] || null;
    } catch (error) {
      const message = parseCloudflareError(error as AxiosError<CloudflareErrorResponse>);
      logger.error(`Failed to get zone by name ${domainName}: ${message}`, 'Cloudflare');
      throw new Error(message);
    }
  }

  async listZones(): Promise<Zone[]> {
    try {
      const response = await this.getClient().get<CloudflareResponse<Zone[]>>('/zones');
      if (!response.data.success) {
        throw new Error(response.data.errors.map((e) => e.message).join('; '));
      }
      return response.data.result;
    } catch (error) {
      const message = parseCloudflareError(error as AxiosError<CloudflareErrorResponse>);
      logger.error(`Failed to list zones: ${message}`, 'Cloudflare');
      throw new Error(message);
    }
  }

  async listDNSRecords(zoneId: string): Promise<DNSRecord[]> {
    try {
      const response = await this.getClient().get<CloudflareResponse<DNSRecord[]>>(
        `/zones/${zoneId}/dns_records`
      );
      if (!response.data.success) {
        throw new Error(response.data.errors.map((e) => e.message).join('; '));
      }
      return response.data.result;
    } catch (error) {
      const message = parseCloudflareError(error as AxiosError<CloudflareErrorResponse>);
      logger.error(`Failed to list DNS records for zone ${zoneId}: ${message}`, 'Cloudflare');
      throw new Error(message);
    }
  }

  async createDNSRecord(
    zoneId: string,
    type: string,
    name: string,
    content: string,
    ttl = 3600,
    proxied = false
  ): Promise<DNSRecord> {
    try {
      const response = await this.getClient().post<CloudflareResponse<DNSRecord>>(
        `/zones/${zoneId}/dns_records`,
        { type, name, content, ttl, proxied }
      );
      if (!response.data.success) {
        const errorMsg = response.data.errors.map((e) => CF_ERROR_MESSAGES[e.code] || e.message).join('; ');
        throw new Error(errorMsg);
      }
      logger.info(`DNS record created: ${type} ${name}`, 'Cloudflare');
      return response.data.result;
    } catch (error) {
      const message = parseCloudflareError(error as AxiosError<CloudflareErrorResponse>);
      logger.error(`Failed to create DNS record: ${message}`, 'Cloudflare');
      throw new Error(message);
    }
  }

  async updateDNSRecord(
    zoneId: string,
    recordId: string,
    type: string,
    name: string,
    content: string,
    ttl = 3600,
    proxied = false
  ): Promise<DNSRecord> {
    try {
      const response = await this.getClient().put<CloudflareResponse<DNSRecord>>(
        `/zones/${zoneId}/dns_records/${recordId}`,
        { type, name, content, ttl, proxied }
      );
      if (!response.data.success) {
        const errorMsg = response.data.errors.map((e) => CF_ERROR_MESSAGES[e.code] || e.message).join('; ');
        throw new Error(errorMsg);
      }
      logger.info(`DNS record updated: ${recordId}`, 'Cloudflare');
      return response.data.result;
    } catch (error) {
      const message = parseCloudflareError(error as AxiosError<CloudflareErrorResponse>);
      logger.error(`Failed to update DNS record ${recordId}: ${message}`, 'Cloudflare');
      throw new Error(message);
    }
  }

  async deleteDNSRecord(zoneId: string, recordId: string): Promise<void> {
    try {
      const response = await this.getClient().delete<CloudflareResponse<{ id: string }>>(
        `/zones/${zoneId}/dns_records/${recordId}`
      );
      if (!response.data.success) {
        const errorMsg = response.data.errors.map((e) => CF_ERROR_MESSAGES[e.code] || e.message).join('; ');
        throw new Error(errorMsg);
      }
      logger.info(`DNS record deleted: ${recordId}`, 'Cloudflare');
    } catch (error) {
      const message = parseCloudflareError(error as AxiosError<CloudflareErrorResponse>);
      logger.error(`Failed to delete DNS record ${recordId}: ${message}`, 'Cloudflare');
      throw new Error(message);
    }
  }
}

export const cloudflareService = new CloudflareService();
