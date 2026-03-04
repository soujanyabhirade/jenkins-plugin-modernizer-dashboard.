export interface Plugin {
    name: string;
    title: string;
    version: string;
    popularity?: number;
    scm?: string;
    buildDate?: string;
    dependencies?: {
        name: string;
        version: string;
        optional: boolean;
    }[];
}
