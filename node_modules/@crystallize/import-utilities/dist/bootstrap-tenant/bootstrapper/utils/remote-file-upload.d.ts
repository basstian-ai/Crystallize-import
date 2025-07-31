/// <reference types="node" />
import { BootstrapperContext } from '.';
export declare const ffmpegAvailable: Promise<unknown>;
export interface RemoteFileUploadResult {
    mimeType: string;
    key: string;
}
export declare function remoteFileUpload({ fileUrl, fileBuffer, fileName, contentType, context, }: {
    fileUrl?: string;
    fileBuffer?: Buffer;
    fileName?: string;
    contentType?: string;
    context: BootstrapperContext;
}): Promise<RemoteFileUploadResult>;
