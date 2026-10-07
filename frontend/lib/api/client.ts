import axios from "axios";
import type {
    CreateRecordInput,
    CreateZoneInput,
    LoginResponse,
    RecordSet,
    RecordSetQuery,
    SignUpInput,
    User,
    HostedZone,
    UpdateRecordInput,
    UpdateZoneInput,
} from "../schema/types";

const api = axios.create({
    baseURL: "https://api.karthickprassana.in",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export function getApiErrorMessage(
    error: unknown,
    fallback: string,
): string {
    if (axios.isAxiosError<{ detail?: string | { msg?: string }[] }>(error)) {
        const detail = error.response?.data?.detail;
        if (typeof detail === "string") {
            return detail;
        }
        if (Array.isArray(detail) && detail[0]?.msg) {
            return detail[0].msg;
        }
    }
    return fallback;
}

export async function loginUser(
    email: string,
    password: string,
): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
    });
    if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
            "route53-user",
            JSON.stringify(response.data.user),
        );
    }
    return response.data;
}

export async function signUpUser(input: SignUpInput): Promise<User> {
    const response = await api.post<User>("/auth/register", input);
    return response.data;
}

export async function createHostedZone(
    input: CreateZoneInput,
): Promise<HostedZone> {
    const response = await api.post<HostedZone>("/hosted-zones", input);
    return response.data;
}

export async function updateHostedZone(
    zoneId: number,
    input: UpdateZoneInput,
): Promise<HostedZone> {
    const response = await api.patch<HostedZone>(
        `/hosted-zones/${zoneId}`,
        input,
    );
    return response.data;
}

export async function deleteHostedZone(zoneId: number): Promise<void> {
    const response = await api.delete(`/hosted-zones/${zoneId}`);
    if (response.status !== 204) {
        throw new Error(`Failed to delete hosted zone with ID ${zoneId}`);
    }
}

export async function createRecordSet(
    zoneId: number,
    input: CreateRecordInput,
): Promise<RecordSet> {
    const response = await api.post<RecordSet>(
        `/hosted-zones/${zoneId}/records`,
        input,
    );
    return response.data;
}

export async function updateRecordSet(
    zoneId: number,
    recordId: number,
    input: UpdateRecordInput,
): Promise<RecordSet> {
    const response = await api.patch<RecordSet>(
        `/hosted-zones/${zoneId}/records/${recordId}`,
        input,
    );
    return response.data;
}

export async function deleteRecordSet(
    zoneId: number,
    recordId: number,
): Promise<void> {
    await api.delete(`/hosted-zones/${zoneId}/records/${recordId}`);
}


export async function getHostedZones(
    search?: string,
    page = 1,
    pageSize = 50,
): Promise<HostedZone[]> {
    const response = await api.get<HostedZone[]>("/hosted-zones", {
        params: {
            search: search || undefined,
            page,
            page_size: pageSize,
        },
    });
    return response.data;
}

export async function getHostedZone(zoneId: number): Promise<HostedZone> {
    const response = await api.get<HostedZone>(`/hosted-zones/${zoneId}`);
    return response.data;
}

export async function getRecordSets(
    zoneId: number,
    query: RecordSetQuery = {},
): Promise<RecordSet[]> {
    const response = await api.get<RecordSet[]>(
        `/hosted-zones/${zoneId}/records`,
        { params: query },
    );
    return response.data;
}

export async function getUserData(): Promise<User> {
    const response = await api.get<User>("/auth/me");
    return response.data;
}

export async function logoutUser(): Promise<void> {
    try {
        await api.post("/auth/logout");
    } finally {
        if (typeof window !== "undefined") {
            window.sessionStorage.removeItem("route53-user");
        }
    }
}