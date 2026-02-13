class ApiConstants {
  // Use 10.0.2.2 for Android Emulator to access localhost
  // Use localhost for iOS Simulator
  // Use your machine's IP for physical device
  static const String baseUrl =
      'http://10.111.27.165:5000/api'; // Updated to match your machine's IP

  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String me = '/auth/me';

  static const String createIssue = '/issue/create';
  static const String myIssues = '/issue/my-issues';
  static const String allIssues = '/issue/all';
}
