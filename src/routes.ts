import { Router } from 'express';
import { createSession, postImage, generateVideo, downloadVideo, deleteSession } from './controllers/timelapseController';

export const timelapseRoutes = Router();

timelapseRoutes.post('/session', createSession);
timelapseRoutes.post('/session/:uuid/image', postImage);
timelapseRoutes.post('/session/:uuid/video', generateVideo);
timelapseRoutes.get('/session/:uuid/video', downloadVideo);
timelapseRoutes.delete('/session/:uuid', deleteSession);
