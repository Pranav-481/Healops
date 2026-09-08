class ProjectModel {
  final String id;
  final String name;
  final String repository;
  final String branch;
  final int healthScore;
  final int securityScore;
  final String status;
  final String lastDeployment;

  ProjectModel({
    required this.id,
    required this.name,
    required this.repository,
    required this.branch,
    required this.healthScore,
    required this.securityScore,
    required this.status,
    required this.lastDeployment,
  });

  factory ProjectModel.fromJson(Map<String, dynamic> json) {
    return ProjectModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      repository: json['repository'] ?? '',
      branch: json['branch'] ?? 'main',
      healthScore: json['healthScore'] ?? 100,
      securityScore: json['securityScore'] ?? 100,
      status: json['status'] ?? 'HEALTHY',
      lastDeployment: json['lastDeployment'] ?? 'Never',
    );
  }
}

class PipelineModel {
  final String id;
  final String projectId;
  final String projectName;
  final String commitHash;
  final String commitMessage;
  final String status;
  final List<dynamic> stages;

  PipelineModel({
    required this.id,
    required this.projectId,
    required this.projectName,
    required this.commitHash,
    required this.commitMessage,
    required this.status,
    required this.stages,
  });

  factory PipelineModel.fromJson(Map<String, dynamic> json) {
    return PipelineModel(
      id: json['id'] ?? '',
      projectId: json['projectId'] ?? '',
      projectName: json['projectName'] ?? '',
      commitHash: json['commitHash'] ?? '',
      commitMessage: json['commitMessage'] ?? '',
      status: json['status'] ?? 'PENDING',
      stages: json['stages'] ?? [],
    );
  }
}

class IncidentModel {
  final String id;
  final String title;
  final String severity;
  final String service;
  final String status;
  final double errorRate;
  final int latencyMs;
  final Map<String, dynamic>? aiAnalysis;

  IncidentModel({
    required this.id,
    required this.title,
    required this.severity,
    required this.service,
    required this.status,
    required this.errorRate,
    required this.latencyMs,
    this.aiAnalysis,
  });

  factory IncidentModel.fromJson(Map<String, dynamic> json) {
    return IncidentModel(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      severity: json['severity'] ?? 'LOW',
      service: json['service'] ?? '',
      status: json['status'] ?? 'OPEN',
      errorRate: (json['errorRate'] as num?)?.toDouble() ?? 0.0,
      latencyMs: json['latencyMs'] ?? 0,
      aiAnalysis: json['aiAnalysis'],
    );
  }
}
