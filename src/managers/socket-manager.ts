import loggerHelper from '@helpers/logger-helper';
import { Server as SocketServer, Socket } from 'socket.io';
import http from 'http';
import jwtHelper from '@helpers/jwt-helper';

export class SocketManager {
	// Singleton
	private static _instance: SocketManager;
	public static get instance() {
		if (!SocketManager._instance) {
			SocketManager._instance = new SocketManager();
		}

		return SocketManager._instance;
	}

	// Properties
	private _io: SocketServer;
	private _storage: Map<string, { userId?: string; socket: Socket }> = new Map(); // Map<socketId, { userId, socket }>
	private _users: Map<string, Set<string>> = new Map(); // Map<userId, Set<socketId>>
	private _rooms: Map<string, Set<string>> = new Map(); // Map<roomId, Set<userId>>

	// Constructor
	private constructor() {}

	// Methods
	public start(server: http.Server): void {
		this._io = new SocketServer(server);

		this._io.on('connection', (socket) => this._onConnection(socket));
	}

	public sendToRoom(roomId: string, event: string, data: unknown, excepts?: string[]): void {
		const roomUserIds = this._rooms.get(roomId);

		// If room not found or empty
		if (!roomUserIds) {
			loggerHelper.warn(`Room not found: ${roomId}`);
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
		const userSockets = this._getUserSockets(userId);
		for (const socket of userSockets) {
			socket.emit(event, data);
		}
	}

	private _getUserSockets(userId: string): Set<Socket> {
		const userSockets = new Set<Socket>();
		const socketIds = this._users.get(userId);

		// If userId not found or empty
		if (!socketIds) {
			return userSockets;
		}

		for (const socketId of socketIds) {
			const data = this._storage.get(socketId);
			if (data) {
				data.userId = userId;
				userSockets.add(data.socket);
			}
		}

		return userSockets;
	}

	private _onConnection(socket: Socket): void {
		loggerHelper.info(`🔌 Socket connected: ${socket.id}`);

		this._storage.set(socket.id, { socket });

		socket.on('login', (token: string) => this._onLogin(socket, token));

		socket.on('disconnect', () => this._onDisconnect(socket));
	}

	private async _onLogin(socket: Socket, token: string): Promise<void> {
		try {
			if (!token) {
				throw new Error('Token not found!');
			}

			const payload = (await jwtHelper.decodeToken(token)) as {
				_id: string;
			};
			if (!payload) {
				throw new Error('Empty payload!');
			}

			const userId = payload._id;
			if (!this._users.has(userId)) {
				this._users.set(userId, new Set()); // Create new Set for userId
			}

			const userSockets = this._users.get(userId);
			userSockets.add(socket.id); // Add socketId to userId
		} catch (error) {
			loggerHelper.error(error);
		}
	}

	private _onDisconnect(socket: Socket): void {
		if (!this._storage.has(socket.id)) {
			return;
		}

		const data = this._storage.get(socket.id);
		if (!data) {
			return;
		}

		this._storage.delete(socket.id);

		const { userId } = data;
		if (!userId) {
			return;
		}

		const userSockets = this._users.get(userId);
		if (!userSockets) {
			return;
		}

		userSockets.delete(socket.id);

		loggerHelper.info(`🔌 Socket disconnected: ${socket.id}`);
	}
}

const socketManager = SocketManager.instance;
export default socketManager;
