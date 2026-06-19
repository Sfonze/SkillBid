export function mapTask(r) {
  return {
    id: r.id,
    smeId: r.sme_id,
    title: r.title,
    description: r.description,
    industry: r.industry,
    language: r.language,
    deliverableType: r.deliverable_type,
    dueDate: r.due_date,
    remuneration: Number(r.remuneration),
    postedAt: r.posted_at,
    status: r.status,
    allocatedStudentId: r.allocated_student_id,
    contractId: r.contract_id,
    smeCompanyName: r.company_name || undefined,
    smeVerified: r.sme_verified !== undefined ? r.sme_verified : undefined,
  };
}

export function mapMilestone(r) {
  return {
    id: r.id,
    taskId: r.task_id,
    position: r.position,
    title: r.title,
    dueDate: r.due_date,
    status: r.status,
    note: r.note,
    submittedAt: r.submitted_at,
  };
}

export function mapApplication(r) {
  return {
    id: r.id,
    taskId: r.task_id,
    studentId: r.student_id,
    status: r.status,
    appliedAt: r.applied_at,
    coverNote: r.cover_note,
  };
}

export function mapContract(r) {
  return {
    id: r.id,
    taskId: r.task_id,
    smeId: r.sme_id,
    studentId: r.student_id,
    status: r.status,
    studentInfo: {
      legalName: r.student_legal_name,
      address: r.student_address,
      iban: r.student_iban,
      taxId: r.student_tax_id,
    },
    terms: {
      remuneration: Number(r.gross_remuneration),
      commissionRate: Number(r.commission_rate),
      netToStudent: Number(r.net_to_student),
      startDate: r.start_date,
      endDate: r.end_date,
    },
    signedAtSme: r.signed_at_sme,
    signedAtStudent: r.signed_at_student,
  };
}

export function mapNotification(r) {
  return {
    id: r.id,
    userId: r.user_id,
    text: r.text,
    read: r.read,
    timestamp: r.created_at,
    link: r.link_view ? { view: r.link_view, taskId: r.link_task_id } : null,
  };
}

export function mapMessage(r) {
  return {
    id: r.id,
    taskId: r.task_id,
    fromUserId: r.from_user_id,
    fromRole: r.from_role,
    text: r.text,
    timestamp: r.created_at,
  };
}

export function mapStudent(r) {
  let skillLevels = [];
  try {
    const raw = r.skill_levels;
    if (Array.isArray(raw)) skillLevels = raw;
    else if (typeof raw === "string" && raw.length > 2) skillLevels = JSON.parse(raw);
  } catch (_) { skillLevels = []; }

  let availableFrom = null;
  if (r.available_from) {
    try { availableFrom = new Date(r.available_from).toISOString().slice(0, 10); }
    catch (_) { availableFrom = null; }
  }

  return {
    id: r.user_id || r.id,
    fullName: r.full_name,
    university: r.university,
    universityEmail: r.university_email,
    languages: Array.isArray(r.languages) ? r.languages : [],
    skills: Array.isArray(r.skills) ? r.skills : [],
    completedTasksCount: r.completed_tasks_count || 0,
    rating: r.rating !== null && r.rating !== undefined ? Number(r.rating) : null,
    verified: r.verified,
    bio: r.bio || "",
    headline: r.headline || "",
    location: r.location || "",
    avatarUrl: r.avatar_data || r.avatar_url || "",
    responseTime: r.response_time || "",
    availableFrom,
    hoursPerWeek: r.hours_per_week || null,
    skillLevels,
    degree: r.degree || "",
  };
}

export function mapSme(r) {
  return {
    id: r.user_id || r.id,
    companyName: r.company_name,
    foundationDate: r.foundation_date,
    vatNumber: r.vat_number,
    coreBusiness: r.core_business,
    tasksCompletedBefore: r.tasks_completed_before,
    verified: r.verified,
    bio: r.bio || "",
    logoUrl: r.logo_url || "",
    location: r.location || "",
    website: r.website || "",
    industry: r.industry || "",
    companySize: r.company_size || "",
  };
}
