import { Request, Response } from 'express';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { exec } from 'child_process';
import path from 'path';

const UPLOAD_PATH = 'uploads';
fs.ensureDirSync(UPLOAD_PATH);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const createSession = (req: Request, res: Response) => {
    console.log('Creating session');
    const sessionID = uuidv4();
    const sessionPath = path.join(UPLOAD_PATH, sessionID);
    fs.ensureDirSync(sessionPath);
    res.send({ uuid: sessionID });
};

export const postImage = (req: Request, res: Response) => {
    console.log('Uploading image');
    const { uuid } = req.params;
    const sessionPath = path.join(UPLOAD_PATH, uuid);
    if (!fs.existsSync(sessionPath)) {
        console.log('Session not found');
        return res.status(404).send('Session not found');
    }
    const imgData = Buffer.from(req.body.image, 'base64');
    const fileCount = fs.readdirSync(sessionPath).length;
    const fileName = (fileCount + 1).toString().padStart(7, '0');
    fs.writeFileSync(path.join(sessionPath, `${fileName}.jpg`), imgData);
    res.send({ message: 'Image uploaded successfully' });
};

export const generateVideo = (req: Request, res: Response) => {
    console.log('Generating video');
    const { uuid } = req.params;
    const sessionPath = path.join(UPLOAD_PATH, uuid);

    if (!fs.existsSync(sessionPath)) {
        return res.status(404).send('Session not found');
    }
    const outputPath = path.join(sessionPath, 'output.mp4');
    const command = `ffmpeg -framerate 24 -i ${sessionPath}/%07d.jpg -c:v libx264 ${outputPath}`;
    console.log('Executing:', command);
    exec(command, (error) => {
        if (error) {
            console.error('Failed to generate video:', error);
            return res.status(500).send('Failed to generate video');
        }
        res.send({ message: 'Video generated successfully', path: outputPath });
    });
};

export const downloadVideo = (req: Request, res: Response) => {
    console.log('Downloading video');
    const { uuid } = req.params;
    const sessionPath = path.resolve(UPLOAD_PATH, uuid); // Using path.resolve to ensure an absolute path
    if (!fs.existsSync(sessionPath)) {
        return res.status(404).send('Session not found');
    }
    const videoPath = path.resolve(sessionPath, 'output.mp4'); // Also ensuring absolute path here
    if (!fs.existsSync(videoPath)) {
        return res.status(404).send('Video not found');
    }
    res.setHeader('Content-Disposition', 'attachment; filename="output.mp4"');
    res.sendFile(videoPath); // Should now be an absolute path
};

export const deleteSession = (req: Request, res: Response) => {
    console.log('Deleting session');
    const { uuid } = req.params;
    const sessionPath = path.join(UPLOAD_PATH, uuid);
    if (fs.existsSync(sessionPath)) {
        fs.removeSync(sessionPath);
    }
    res.send({ message: 'Session deleted successfully' });
};
