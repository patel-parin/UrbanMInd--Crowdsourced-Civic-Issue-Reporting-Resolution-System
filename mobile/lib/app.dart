import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'features/auth/providers/auth_provider.dart';
import 'features/home/providers/home_provider.dart';
import 'routes/app_routes.dart';
import 'core/theme/app_theme.dart';
import 'core/services/socket_service.dart';

class UrbanMindApp extends StatelessWidget {
  const UrbanMindApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<SocketService>(
          create: (_) => SocketService()..initSocket(),
          dispose: (_, service) => service.dispose(),
        ),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProxyProvider<SocketService, HomeProvider>(
          create: (context) =>
              HomeProvider(socketService: context.read<SocketService>()),
          update: (_, socketService, previous) =>
              HomeProvider(socketService: socketService),
        ),
      ],
      child: MaterialApp(
        title: 'UrbanMind',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        initialRoute: AppRoutes.splash,
        routes: AppRoutes.routes,
      ),
    );
  }
}
