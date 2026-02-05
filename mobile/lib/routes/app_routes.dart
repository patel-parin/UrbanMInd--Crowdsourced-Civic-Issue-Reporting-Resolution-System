import 'package:flutter/material.dart';
import '../features/auth/screens/login_screen.dart';
import '../features/auth/screens/register_screen.dart';
import '../features/auth/screens/splash_screen.dart';
import '../features/home/screens/home_screen.dart';
import '../features/citizen/screens/report_issue_screen.dart';
import '../features/citizen/screens/my_issues_screen.dart';

class AppRoutes {
  static const String splash = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String dashboard = '/dashboard';
  static const String reportIssue = '/report-issue';
  static const String myIssues = '/my-issues';

  static Map<String, WidgetBuilder> get routes => {
        splash: (context) => const SplashScreen(),
        login: (context) => const LoginScreen(),
        register: (context) => const RegisterScreen(),
        dashboard: (context) => const HomeScreen(),
        reportIssue: (context) => const ReportIssueScreen(),
        myIssues: (context) => const MyIssuesScreen(),
      };
}
