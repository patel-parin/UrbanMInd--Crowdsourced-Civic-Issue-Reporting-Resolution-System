import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/ui/animated_widgets.dart';
import '../../../../core/ui/glass_container.dart';

class AdminContractorsScreen extends StatelessWidget {
  const AdminContractorsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final contractors = [
      {'name': 'ABC Construction', 'email': 'contact@abc.com', 'jobs': '12'},
      {
        'name': 'City Fixers Ltd',
        'email': 'support@cityfixers.com',
        'jobs': '8'
      },
      {'name': 'RoadWorks Inc', 'email': 'info@roadworks.com', 'jobs': '24'},
    ];

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('Manage Contractors',
            style: TextStyle(color: Colors.white)),
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon:
              const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: AppColors.accent),
            onPressed: () {
              // TODO: Add Contractor Dialog
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          Container(
            decoration: const BoxDecoration(
              gradient: AppColors.primaryGradient,
            ),
          ),
          ListView.builder(
            padding: const EdgeInsets.fromLTRB(16, 100, 16, 16),
            itemCount: contractors.length,
            itemBuilder: (context, index) {
              final contractor = contractors[index];
              return FadeSlideIn(
                delay: index * 100,
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: GlassContainer(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.business_rounded,
                              color: Colors.white),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                contractor['name']!,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                              Text(
                                contractor['email']!,
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.6),
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              contractor['jobs']!,
                              style: const TextStyle(
                                color: AppColors.accent,
                                fontWeight: FontWeight.bold,
                                fontSize: 18,
                              ),
                            ),
                            const Text(
                              'Jobs',
                              style: TextStyle(
                                  color: Colors.white54, fontSize: 10),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        backgroundColor: AppColors.accent,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}
