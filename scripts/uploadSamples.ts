// scripts/uploadSamples.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Adjust this path to where your sample files are located.
const samplesDir = path.join(__dirname, '../../sonic-garbage/wavs/processed/loop/radio');
console.log("Looking for files in:", samplesDir);

// Recursively get all file paths in a directory.
function getAllFiles(dir: string, files: string[] = []): string[] {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            // If it's a directory, recursively get its files.
            getAllFiles(fullPath, files);
        } else {
            files.push(fullPath);
        }
    }
    return files;
}

async function uploadSamples() {
    // Get all file paths recursively from the samplesDir.
    const allFiles = getAllFiles(samplesDir);
    console.log(`Found ${allFiles.length} file(s) recursively`);

    for (const filePath of allFiles) {
        const fileName = path.basename(filePath);
        console.log("Processing file:", filePath);

        // Read file data if needed.
        const fileData = fs.readFileSync(filePath);
        const ext = path.extname(fileName).toLowerCase();

        // Determine MIME type.
        let mimetype = 'application/octet-stream';
        if (ext === '.mp3') mimetype = 'audio/mpeg';
        else if (ext === '.wav') mimetype = 'audio/wav';
        else if (ext === '.ogg') mimetype = 'audio/ogg';

        try {
            // Create a new record in the database.
            const result = await prisma.sample.create({
                data: {
                    filename: fileName,
                    type: 'RADIO', // Adjust based on your enum and desired categorization.
                },
            });
            console.log(`Uploaded ${fileName} with id ${result.id}`);
        } catch (error) {
            console.error(`Error uploading ${fileName}:`, error);
        }
    }
}

uploadSamples()
    .then(() => {
        console.log("Upload complete");
    })
    .catch((error) => {
        console.error("Error in uploadSamples:", error);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
