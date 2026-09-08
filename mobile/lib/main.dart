import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app/app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Firebase and local preferences initialize here
  runApp(
    const ProviderScope(
      child: DevSecOpsApp(),
    ),
  );
}
