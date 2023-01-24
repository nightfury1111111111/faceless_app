import { atom } from "jotai";

export function saveToLocalStorage(key: string, value: object) {
    localStorage.setItem(key, JSON.stringify(value));
}

export function loadLocalStorage(key: string) {
    let value = localStorage.getItem(key);
    if (value === null) {
        return {};
    } else {
        return JSON.parse(value);
    }
}

interface User {
    walletAddress: string | null,
    note: string | null,
    roles: string | null
}

interface Moderator {
    _id: string,
    walletAddress: string,
}

interface Role {
    id: string,
    text: string
}

export const profile = atom<User>({ walletAddress: null, note: null, roles: null });
export const profileModerators = atom<Moderator[]>([]);
export const profileRoles = atom<Role[]>([]);