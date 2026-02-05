import axios, { AxiosInstance } from 'axios';
import { config } from '../config';

interface CloudflareResponse<T> {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: string[];
  result: T;
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
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.cloudflare.com/client/v4',
      headers: {
        Authorization: `Bearer ${config.cloudflare.apiToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async createZone(domainName: string): Promise<Zone> {
    const response = await this.client.post<CloudflareResponse<Zone>>('/zones', {
      name: domainName,
      account: { id: config.cloudflare.accountId },
      jump_start: true,
    });

    if (!response.data.success) {
      throw new Error(response.data.errors.map((e) => e.message).join(', '));
    }

    return response.data.result;
  }

  async getZone(zoneId: string): Promise<Zone> {
    const response = await this.client.get<CloudflareResponse<Zone>>(`/zones/${zoneId}`);

    if (!response.data.success) {
      throw new Error(response.data.errors.map((e) => e.message).join(', '));
    }

    return response.data.result;
  }

  async getZoneByName(domainName: string): Promise<Zone | null> {
    const response = await this.client.get<CloudflareResponse<Zone[]>>('/zones', {
      params: { name: domainName },
    });

    if (!response.data.success) {
      throw new Error(response.data.errors.map((e) => e.message).join(', '));
    }

    return response.data.result[0] || null;
  }

  async listZones(): Promise<Zone[]> {
    const response = await this.client.get<CloudflareResponse<Zone[]>>('/zones');

    if (!response.data.success) {
      throw new Error(response.data.errors.map((e) => e.message).join(', '));
    }

    return response.data.result;
  }

  async listDNSRecords(zoneId: string): Promise<DNSRecord[]> {
    const response = await this.client.get<CloudflareResponse<DNSRecord[]>>(
      `/zones/${zoneId}/dns_records`
    );

    if (!response.data.success) {
      throw new Error(response.data.errors.map((e) => e.message).join(', '));
    }

    return response.data.result;
  }

  async createDNSRecord(
    zoneId: string,
    type: string,
    name: string,
    content: string,
    ttl = 3600,
    proxied = false
  ): Promise<DNSRecord> {
    const response = await this.client.post<CloudflareResponse<DNSRecord>>(
      `/zones/${zoneId}/dns_records`,
      { type, name, content, ttl, proxied }
    );

    if (!response.data.success) {
      throw new Error(response.data.errors.map((e) => e.message).join(', '));
    }

    return response.data.result;
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
    const response = await this.client.put<CloudflareResponse<DNSRecord>>(
      `/zones/${zoneId}/dns_records/${recordId}`,
      { type, name, content, ttl, proxied }
    );

    if (!response.data.success) {
      throw new Error(response.data.errors.map((e) => e.message).join(', '));
    }

    return response.data.result;
  }

  async deleteDNSRecord(zoneId: string, recordId: string): Promise<void> {
    const response = await this.client.delete<CloudflareResponse<{ id: string }>>(
      `/zones/${zoneId}/dns_records/${recordId}`
    );

    if (!response.data.success) {
      throw new Error(response.data.errors.map((e) => e.message).join(', '));
    }
  }
}

export const cloudflareService = new CloudflareService();
