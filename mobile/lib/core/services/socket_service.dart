import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../constants/api_constants.dart';

class SocketService {
  late IO.Socket _socket;
  bool _isConnected = false;

  bool get isConnected => _isConnected;

  void initSocket() {
    // Extract host and port from baseUrl (remove /api)
    final uri = Uri.parse(ApiConstants.baseUrl);
    final socketUrl = '${uri.scheme}://${uri.host}:${uri.port}';

    print('DEBUG: Connecting to Socket.IO at $socketUrl');

    _socket = IO.io(
        socketUrl,
        IO.OptionBuilder()
            .setTransports(['websocket'])
            .disableAutoConnect()
            .build());

    _socket.connect();

    _socket.onConnect((_) {
      print('DEBUG: Socket Connected');
      _isConnected = true;
    });

    _socket.onDisconnect((_) {
      print('DEBUG: Socket Disconnected');
      _isConnected = false;
    });

    _socket.on(
        'connect_error', (data) => print('DEBUG: Socket Connect Error: $data'));
    _socket.on('error', (data) => print('DEBUG: Socket Error: $data'));
  }

  void listen(String event, Function(dynamic) callback) {
    _socket.on(event, callback);
  }

  void emit(String event, dynamic data) {
    _socket.emit(event, data);
  }

  void dispose() {
    _socket.disconnect();
    _socket.dispose();
  }
}
