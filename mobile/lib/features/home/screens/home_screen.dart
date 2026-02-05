import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../auth/providers/auth_provider.dart';
import '../../citizen/screens/citizen_home_screen.dart';
import '../../citizen/screens/my_issues_screen.dart';
import '../../profile/screens/profile_screen.dart';
import '../../contractor/screens/contractor_home_screen.dart';

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
      const MyIssuesScreen(), // Placeholder for Map or Issues
      const ProfileScreen(),
    ];

    // Screens for Contractor
    final List<Widget> contractorScreens = [
      const ContractorHomeScreen(),
      const ProfileScreen(),
    ];

    print('User Role: $userRole'); // Debug

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: userRole == 'citizen' ? citizenScreens : contractorScreens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          // Basic safety check for index out of bounds if roles switch
          if (userRole == 'contractor' && index >= contractorScreens.length) {
            index = 0;
          }
          setState(() {
            _currentIndex = index;
          });
        },
        destinations: userRole == 'citizen'
            ? const [
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
              ]
            : const [
                NavigationDestination(
                  icon: Icon(Icons.work_outline),
                  selectedIcon: Icon(Icons.work_rounded),
                  label: 'Jobs',
                ),
                NavigationDestination(
                  icon: Icon(Icons.person_outline),
                  selectedIcon: Icon(Icons.person_rounded),
                  label: 'Profile',
                ),
              ],
      ),
      floatingActionButton: userRole == 'citizen'
          ? FloatingActionButton.extended(
              onPressed: () {
                // Navigate to Report Issue
                Navigator.pushNamed(context, '/report-issue');
              },
              icon: const Icon(Icons.add_a_photo_outlined),
              label: const Text('Report Issue'),
            )
          : null, // Contractors might have different FAB
    );
  }
}
