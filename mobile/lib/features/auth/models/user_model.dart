class UserModel {
  final String id;
  final String name;
  final String email;
  final String role;
  final int impactPoints;
  final int citizenLevel;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.impactPoints = 0,
    this.citizenLevel = 1,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'citizen',
      impactPoints: json['impactPoints'] ?? 0,
      citizenLevel: json['citizenLevel'] ?? 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'email': email,
      'role': role,
      'impactPoints': impactPoints,
      'citizenLevel': citizenLevel,
    };
  }
}
