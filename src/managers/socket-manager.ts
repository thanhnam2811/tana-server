import logUtil from '@utils/log-util';
import { Server as SocketServer, Socket } from 'socket.io';
import http from 'http';
import jwtHelper from '@helpers/jwt-helper';

export class SocketManager {
	// Singleton
	private static instance: SocketManager;
	public static getInstance() {
		if (!SocketManager.instance) {
			SocketManager.instance = new SocketManager();
		}

		return SocketManager.instance;
	}

	// Properties
	private io: SocketServer;
	private storage: Map<string, { userId?: string; socket: Socket }> = new Map(); // Map<socketId, { userId, socket }>
	private users: Map<string, Set<string>> = new Map(); // Map<userId, Set<socketId>>
	private rooms: Map<string, Set<string>> = new Map(); // Map<roomId, Set<userId>>

	// Constructor
	private constructor() {}

	// Methods
	public start(server: http.Server): void {
		this.io = new SocketServer(server);

		this.io.on('connection', (socket) => this.onConnection(socket));
	}

	public sendToRoom(roomId: string, event: string, data: unknown, excepts?: string[]): void {
		const roomUserIds = this.rooms.get(roomId);

		// If room not found or empty
		if (!roomUserIds) {
			logUtil.warn(`Room not found: ${roomId}`);
			return;
		}

		for (const userId of roomUserIds) {
			// If userId is in excepts
			if (excepts?.includes(userId)) {
				continue;
			}

			this.sendToUser(userId, event, data);
		}
	}

	public sendToUsers(userIds: string[], event: string, data: unknown): void {
		for (const userId of userIds) {
			this.sendToUser(userId, event, data);
		}
	}

	public sendToUser(userId: string, event: string, data: unknown): void {
		const userSockets = this.getUserSockets(userId);
		for (const socket of userSockets) {
			socket.emit(event, data);
		}
	}

	private getUserSockets(userId: string): Set<Socket> {
		const userSockets = new Set<Socket>();
		const socketIds = this.users.get(userId);

		// If userId not found or empty
		if (!socketIds) {
			return userSockets;
		}

		for (const socketId of socketIds) {
			const data = this.storage.get(socketId);
			if (data) {
				data.userId = userId;
				userSockets.add(data.socket);
			}
		}

		return userSockets;
	}

	private onConnection(socket: Socket): void {
		logUtil.info(`🔌 Socket connected: ${socket.id}`);

		this.storage.set(socket.id, { socket });

		socket.on('login', (token: string) => this.onLogin(socket, token));

		socket.on('disconnect', () => this.onDisconnect(socket));
	}

	private async onLogin(socket: Socket, token: string): Promise<void> {
		try {
			if (!token) {
				throw new Error('Token not found!');
			}

			const payload = (await jwtHelper.decodeToken(token)) as {
				id: string;
			};
			if (!payload) {
				throw new Error('Empty payload!');
			}

			const userId = payload.id;
			if (!this.users.has(userId)) {
				this.users.set(userId, new Set()); // Create new Set for userId
			}

			const userSockets = this.users.get(userId);
			userSockets.add(socket.id); // Add socketId to userId
		} catch (error) {
			logUtil.error(error);
		}
	}

	private onDisconnect(socket: Socket): void {
		if (!this.storage.has(socket.id)) {
			return;
		}

		const data = this.storage.get(socket.id);
		if (!data) {
			return;
		}

		this.storage.delete(socket.id);

		const { userId } = data;
		if (!userId) {
			return;
		}

		const userSockets = this.users.get(userId);
		if (!userSockets) {
			return;
		}

		userSockets.delete(socket.id);

		logUtil.info(`🔌 Socket disconnected: ${socket.id}`);
	}
}

const socketManager = SocketManager.getInstance();
export default socketManager;
