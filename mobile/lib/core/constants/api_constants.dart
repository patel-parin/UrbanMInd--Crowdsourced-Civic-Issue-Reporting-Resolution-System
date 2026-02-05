class ApiConstants {
  // Use 10.0.2.2 for Android Emulator to access localhost
  static const String baseUrl = 'http://10.111.27.165:5000/api';

  static const String login = '$baseUrl/auth/login';
  static const String register = '$baseUrl/auth/register';
  static const String me = '$baseUrl/auth/me';

  static const String createIssue = '$baseUrl/issue/create';
  static const String myIssues = '$baseUrl/issue/my-issues';
}
