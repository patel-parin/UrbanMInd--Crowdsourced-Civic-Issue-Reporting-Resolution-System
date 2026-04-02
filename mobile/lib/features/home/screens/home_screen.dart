import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../auth/providers/auth_provider.dart';
import '../../citizen/screens/citizen_home_screen.dart';
import '../../citizen/screens/my_issues_screen.dart';
import '../../profile/screens/profile_screen.dart';
import '../../contractor/screens/contractor_home_screen.dart';
import '../../admin/screens/admin_home_screen.dart';
import '../../admin/screens/admin_issues_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final userRole = Provider.of<AuthProvider>(context).user?.role ?? 'citizen';

    // Screens for Citizen
    final List<Widget> citizenScreens = [
      const CitizenHomeScreen(),
      const MyIssuesScreen(),
      const ProfileScreen(),
    ];

    // Screens for Contractor
    final List<Widget> contractorScreens = [
      const ContractorHomeScreen(),
      const ProfileScreen(), // Or ContractorProfileScreen
    ];

    // Screens for Admin
    final List<Widget> adminScreens = [
      const AdminHomeScreen(),
      const AdminIssuesScreen(),
      const ProfileScreen(),
    ];

    List<Widget> currentScreens;
    if (userRole == 'admin') {
      currentScreens = adminScreens;
    } else if (userRole == 'contractor') {
      currentScreens = contractorScreens;
    } else {
      currentScreens = citizenScreens;
    }

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: currentScreens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          if (index >= currentScreens.length) index = 0;
          setState(() {
            _currentIndex = index;
          });
        },
        destinations: _getDestinations(userRole),
      ),
      floatingActionButton: userRole == 'citizen'
          ? FloatingActionButton.extended(
              onPressed: () => Navigator.pushNamed(context, '/report-issue'),
              icon: const Icon(Icons.add_a_photo_outlined),
              label: const Text('Report Issue'),
            )
          : null,
    );
  }

  List<NavigationDestination> _getDestinations(String role) {
    if (role == 'admin') {
      return const [
        NavigationDestination(
          icon: Icon(Icons.dashboard_outlined),
          selectedIcon: Icon(Icons.dashboard_rounded),
          label: 'Dashboard',
        ),
        NavigationDestination(
          icon: Icon(Icons.admin_panel_settings_outlined),
          selectedIcon: Icon(Icons.admin_panel_settings_rounded),
          label: 'Issues',
        ),
        NavigationDestination(
          icon: Icon(Icons.person_outline),
          selectedIcon: Icon(Icons.person_rounded),
          label: 'Profile',
        ),
      ];
    } else if (role == 'contractor') {
      return const [
        NavigationDestination(
          icon: Icon(Icons.work_outlined),
          selectedIcon: Icon(Icons.work_rounded),
          label: 'Jobs',
        ),
        NavigationDestination(
          icon: Icon(Icons.person_outline),
          selectedIcon: Icon(Icons.person_rounded),
          label: 'Profile',
        ),
      ];
    } else {
      return const [
        NavigationDestination(
          icon: Icon(Icons.home_outlined),
          selectedIcon: Icon(Icons.home_rounded),
          label: 'Home',
        ),
        NavigationDestination(
          icon: Icon(Icons.list_alt_outlined),
          selectedIcon: Icon(Icons.list_alt_rounded),
          label: 'My Issues',
        ),
        NavigationDestination(
          icon: Icon(Icons.person_outline),
          selectedIcon: Icon(Icons.person_rounded),
          label: 'Profile',
        ),
      ];
    }
  }
}
