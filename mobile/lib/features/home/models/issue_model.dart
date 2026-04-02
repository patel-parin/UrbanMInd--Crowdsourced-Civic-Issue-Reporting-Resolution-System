class IssueModel {
  final String id;
  final String title;
  final String description;
  final String status;
  final String category;
  final String? imageUrl;
  final String address;
  final String city;
  final DateTime createdAt;

  IssueModel({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    required this.category,
    this.imageUrl,
    required this.address,
    required this.city,
    required this.createdAt,
  });

  factory IssueModel.fromJson(Map<String, dynamic> json) {
    return IssueModel(
      id: json['_id'] ?? '',
      title: json['title'] ?? 'No Title',
      description: json['description'] ?? '',
      status: json['status'] ?? 'pending',
      category: json['category'] ?? 'General',
      imageUrl: json['imageUrl'],
      address: json['gps']?['address'] ?? 'Unknown Location',
      city: json['city'] ?? 'Unknown City',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
    );
  }
}
