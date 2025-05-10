-- aims_db.academiccalendar definition

CREATE TABLE `academiccalendar` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_deleted` tinyint(1) NOT NULL,
  `txn_no` int NOT NULL,
  `ins_ts` datetime NOT NULL,
  `upd_ts` datetime NOT NULL,
  `txn_login_id` varchar(40) DEFAULT NULL,
  `acad_session` varchar(10) NOT NULL,
  `event_code` varchar(100) NOT NULL,
  `event_value` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `academiccalendar_acad_session_event_code` (`acad_session`,`event_code`),
  KEY `academiccalendar_txn_no` (`txn_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- aims_db.courseslottiming definition

CREATE TABLE `courseslottiming` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_deleted` tinyint(1) NOT NULL,
  `txn_no` int NOT NULL,
  `ins_ts` datetime NOT NULL,
  `upd_ts` datetime NOT NULL,
  `txn_login_id` varchar(40) DEFAULT NULL,
  `slot` varchar(40) NOT NULL,
  `week_day` smallint NOT NULL,
  `start_time` smallint NOT NULL,
  `end_time` smallint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `courseslottiming_slot_week_day_start_time` (`slot`,`week_day`,`start_time`),
  KEY `courseslottiming_txn_no` (`txn_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- aims_db.feedbackform definition

CREATE TABLE `feedbackform` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_deleted` tinyint(1) NOT NULL,
  `txn_no` int NOT NULL,
  `ins_ts` datetime NOT NULL,
  `upd_ts` datetime NOT NULL,
  `txn_login_id` varchar(40) DEFAULT NULL,
  `form_name` varchar(50) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `form_type` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `feedbackform_form_name_form_type_is_active` (`form_name`,`form_type`,`is_active`),
  KEY `feedbackform_txn_no` (`txn_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- aims_db.passwordresetkey definition

CREATE TABLE `passwordresetkey` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_deleted` tinyint(1) NOT NULL,
  `txn_no` int NOT NULL,
  `ins_ts` datetime NOT NULL,
  `upd_ts` datetime NOT NULL,
  `txn_login_id` varchar(40) DEFAULT NULL,
  `login_id` varchar(40) NOT NULL,
  `prk` varchar(40) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `passwordresetkey_txn_no` (`txn_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- aims_db.person definition

CREATE TABLE `person` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_deleted` tinyint(1) NOT NULL,
  `txn_no` int NOT NULL,
  `ins_ts` datetime NOT NULL,
  `upd_ts` datetime NOT NULL,
  `txn_login_id` varchar(40) DEFAULT NULL,
  `org_id` varchar(40) NOT NULL,
  `gender` char(1) DEFAULT NULL,
  `dept_name` varchar(10) NOT NULL,
  `year_of_entry` varchar(4) NOT NULL,
  `degree` varchar(20) DEFAULT NULL,
  `category` varchar(10) DEFAULT NULL,
  `deg_type` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `person_org_id` (`org_id`),
  KEY `person_txn_no` (`txn_no`)
) ENGINE=InnoDB AUTO_INCREMENT=291 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- aims_db.workflownote definition

CREATE TABLE `workflownote` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_deleted` tinyint(1) NOT NULL,
  `txn_no` int NOT NULL,
  `ins_ts` datetime NOT NULL,
  `upd_ts` datetime NOT NULL,
  `txn_login_id` varchar(40) DEFAULT NULL,
  `entity_key` int NOT NULL,
  `entity_name` varchar(50) NOT NULL,
  `note` text,
  PRIMARY KEY (`id`),
  KEY `workflownote_txn_no` (`txn_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- aims_db.feedbackquestion definition

CREATE TABLE `feedbackquestion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_deleted` tinyint(1) NOT NULL,
  `txn_no` int NOT NULL,
  `ins_ts` datetime NOT NULL,
  `upd_ts` datetime NOT NULL,
  `txn_login_id` varchar(40) DEFAULT NULL,
  `form_id` int NOT NULL,
  `question` varchar(500) NOT NULL,
  `ans_options` json DEFAULT NULL,
  `is_optional` tinyint(1) NOT NULL,
  `is_multianswer` tinyint(1) NOT NULL,
  `is_text` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `feedbackquestion_form_id_question` (`form_id`,`question`),
  KEY `feedbackquestion_txn_no` (`txn_no`),
  KEY `feedbackquestion_form_id` (`form_id`),
  CONSTRAINT `feedbackquestion_ibfk_1` FOREIGN KEY (`form_id`) REFERENCES `feedbackform` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- aims_db.`user` definition

CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_deleted` tinyint(1) NOT NULL,
  `txn_no` int NOT NULL,
  `ins_ts` datetime NOT NULL,
  `upd_ts` datetime NOT NULL,
  `txn_login_id` varchar(40) DEFAULT NULL,
  `login_id` varchar(40) NOT NULL,
  `password_hashed` text NOT NULL,
  `email` varchar(150) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `is_locked` tinyint(1) NOT NULL,
  `person_id` int DEFAULT NULL,
  `role` varchar(4) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_login_id` (`login_id`),
  UNIQUE KEY `user_email` (`email`),
  UNIQUE KEY `user_person_id` (`person_id`),
  KEY `user_txn_no` (`txn_no`),
  CONSTRAINT `user_ibfk_1` FOREIGN KEY (`person_id`) REFERENCES `person` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=291 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- aims_db.userdoc definition

CREATE TABLE `userdoc` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_deleted` tinyint(1) NOT NULL,
  `txn_no` int NOT NULL,
  `ins_ts` datetime NOT NULL,
  `upd_ts` datetime NOT NULL,
  `txn_login_id` varchar(40) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `category` varchar(20) NOT NULL,
  `description` text NOT NULL,
  `file_name` text NOT NULL,
  `doc` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userdoc_txn_no` (`txn_no`),
  KEY `userdoc_user_id` (`user_id`),
  CONSTRAINT `userdoc_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- aims_db.academicmilestone definition

CREATE TABLE `academicmilestone` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_deleted` tinyint(1) NOT NULL,
  `txn_no` int NOT NULL,
  `ins_ts` datetime NOT NULL,
  `upd_ts` datetime NOT NULL,
  `txn_login_id` varchar(40) DEFAULT NULL,
  `student_id` int NOT NULL,
  `milestone` varchar(40) NOT NULL,
  `status` varchar(40) NOT NULL,
  `status_dt` date NOT NULL,
  `remarks` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `academicmilestone_student_id_milestone_status_status_dt` (`student_id`,`milestone`,`status`,`status_dt`),
  KEY `academicmilestone_txn_no` (`txn_no`),
  KEY `academicmilestone_student_id` (`student_id`),
  CONSTRAINT `academicmilestone_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- aims_db.batchadvisors definition

CREATE TABLE `batchadvisors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_deleted` tinyint(1) NOT NULL,
  `txn_no` int NOT NULL,
  `ins_ts` datetime NOT NULL,
  `upd_ts` datetime NOT NULL,
  `txn_login_id` varchar(40) DEFAULT NULL,
  `user_id` int NOT NULL,
  `year_of_entry` varchar(4) NOT NULL,
  `for_degree` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `batchadvisors_user_id_year_of_entry_for_degree` (`user_id`,`year_of_entry`,`for_degree`),
  KEY `batchadvisors_txn_no` (`txn_no`),
  KEY `batchadvisors_user_id` (`user_id`),
  CONSTRAINT `batchadvisors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- aims_db.course definition

CREATE TABLE `course` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_deleted` tinyint(1) NOT NULL,
  `txn_no` int NOT NULL,
  `ins_ts` datetime NOT NULL,
  `upd_ts` datetime NOT NULL,
  `txn_login_id` varchar(40) DEFAULT NULL,
  `code` varchar(20) NOT NULL,
  `title` varchar(200) NOT NULL,
  `ltp` varchar(40) DEFAULT NULL,
  `status` varchar(4) NOT NULL,
  `author_id` int DEFAULT NULL,
  `freq` varchar(1) NOT NULL,
  `has_lab` tinyint(1) NOT NULL,
  `prereqs` varchar(200) DEFAULT NULL,
  `objectives` mediumtext,
  `req_visiting_fac` tinyint(1) NOT NULL,
  `course_supersedes` varchar(100) DEFAULT NULL,
  `course_overlaps` varchar(100) DEFAULT NULL,
  `tkp` json NOT NULL,
  `tgap` json NOT NULL,
  `modules` json NOT NULL,
  `teaching` json NOT NULL,
  `learning` json NOT NULL,
  `evaluation` json NOT NULL,
  `ref_material` json NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_code` (`code`),
  KEY `course_txn_no` (`txn_no`),
  KEY `course_author_id` (`author_id`),
  CONSTRAINT `course_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- aims_db.courseoffering definition

CREATE TABLE `courseoffering` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_deleted` tinyint(1) NOT NULL,
  `txn_no` int NOT NULL,
  `ins_ts` datetime NOT NULL,
  `upd_ts` datetime NOT NULL,
  `txn_login_id` varchar(40) DEFAULT NULL,
  `acad_session` varchar(10) NOT NULL,
  `course_id` int DEFAULT NULL,
  `status` varchar(2) NOT NULL,
  `slot` varchar(10) DEFAULT NULL,
  `section` varchar(2) NOT NULL,
  `dept_name` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `courseoffering_course_id_acad_session_status_section_dept_name` (`course_id`,`acad_session`,`status`,`section`,`dept_name`),
  KEY `courseoffering_txn_no` (`txn_no`),
  KEY `courseoffering_course_id` (`course_id`),
  CONSTRAINT `courseoffering_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- aims_db.dcmember definition

CREATE TABLE `dcmember` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_deleted` tinyint(1) NOT NULL,
  `txn_no` int NOT NULL,
  `ins_ts` datetime NOT NULL,
  `upd_ts` datetime NOT NULL,
  `txn_login_id` varchar(40) DEFAULT NULL,
  `role` varchar(2) NOT NULL,
  `student_id` int NOT NULL,
  `member_id` int NOT NULL,
  `effective_from` date NOT NULL,
  `effective_to` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dcmember_student_id_member_id_role_effective_from` (`student_id`,`member_id`,`role`,`effective_from`),
  KEY `dcmember_txn_no` (`txn_no`),
  KEY `dcmember_student_id` (`student_id`),
  KEY `dcmember_member_id` (`member_id`),
  CONSTRAINT `dcmember_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `dcmember_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- aims_db.dcnote definition

CREATE TABLE `dcnote` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_deleted` tinyint(1) NOT NULL,
  `txn_no` int NOT NULL,
  `ins_ts` datetime NOT NULL,
  `upd_ts` datetime NOT NULL,
  `txn_login_id` varchar(40) DEFAULT NULL,
  `student_id` int NOT NULL,
  `dc_member_id` int NOT NULL,
  `acad_session` varchar(10) NOT NULL,
  `note` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dcnote_student_id_dc_member_id_acad_session` (`student_id`,`dc_member_id`,`acad_session`),
  KEY `dcnote_txn_no` (`txn_no`),
  KEY `dcnote_student_id` (`student_id`),
  KEY `dcnote_dc_member_id` (`dc_member_id`),
  CONSTRAINT `dcnote_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `dcnote_ibfk_2` FOREIGN KEY (`dc_member_id`) REFERENCES `dcmember` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- aims_db.feestransaction definition

CREATE TABLE `feestransaction` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_deleted` tinyint(1) NOT NULL,
  `txn_no` int NOT NULL,
  `ins_ts` datetime NOT NULL,
  `upd_ts` datetime NOT NULL,
  `txn_login_id` varchar(40) DEFAULT NULL,
  `student_id` int NOT NULL,
  `acad_session` varchar(10) NOT NULL,
  `fees_txn_amt` int NOT NULL,
  `fees_txn_no` varchar(50) NOT NULL,
  `fees_txn_dt` date NOT NULL,
  `fees_txn_bank` varchar(100) NOT NULL,
  `doc_file_name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `feestransaction_student_id_acad_session_fees_txn_no_fees_2d17ad8` (`student_id`,`acad_session`,`fees_txn_no`,`fees_txn_bank`,`is_deleted`,`fees_txn_amt`,`fees_txn_dt`),
  KEY `feestransaction_txn_no` (`txn_no`),
  KEY `feestransaction_student_id` (`student_id`),
  CONSTRAINT `feestransaction_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- aims_db.knownface definition

CREATE TABLE `knownface` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_deleted` tinyint(1) NOT NULL,
  `txn_no` int NOT NULL,
  `ins_ts` datetime NOT NULL,
  `upd_ts` datetime NOT NULL,
  `txn_login_id` varchar(40) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `face_enc` text NOT NULL,
  `photo` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `knownface_txn_no` (`txn_no`),
  KEY `knownface_user_id` (`user_id`),
  CONSTRAINT `knownface_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- aims_db.studentcredits definition

CREATE TABLE `studentcredits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_deleted` tinyint(1) NOT NULL,
  `txn_no` int NOT NULL,
  `ins_ts` datetime NOT NULL,
  `upd_ts` datetime NOT NULL,
  `txn_login_id` varchar(40) DEFAULT NULL,
  `student_id` int NOT NULL,
  `acad_session` varchar(10) NOT NULL,
  `cgpa` float NOT NULL,
  `sgpa` float NOT NULL,
  `cred_earned` float NOT NULL,
  `cred_registered` float NOT NULL,
  `cred_earned_total` float NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `studentcredits_student_id_acad_session` (`student_id`,`acad_session`),
  KEY `studentcredits_txn_no` (`txn_no`),
  KEY `studentcredits_student_id` (`student_id`),
  CONSTRAINT `studentcredits_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- aims_db.studentsupervisor definition

CREATE TABLE `studentsupervisor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_deleted` tinyint(1) NOT NULL,
  `txn_no` int NOT NULL,
  `ins_ts` datetime NOT NULL,
  `upd_ts` datetime NOT NULL,
  `txn_login_id` varchar(40) DEFAULT NULL,
  `student_id` int NOT NULL,
  `supervisor_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `studentsupervisor_student_id_supervisor_id` (`student_id`,`supervisor_id`),
  KEY `studentsupervisor_txn_no` (`txn_no`),
  KEY `studentsupervisor_student_id` (`student_id`),
  KEY `studentsupervisor_supervisor_id` (`supervisor_id`),
  CONSTRAINT `studentsupervisor_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `studentsupervisor_ibfk_2` FOREIGN KEY (`supervisor_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- aims_db.attendancephoto definition

CREATE TABLE `attendancephoto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_deleted` tinyint(1) NOT NULL,
  `txn_no` int NOT NULL,
  `ins_ts` datetime NOT NULL,
  `upd_ts` datetime NOT NULL,
  `txn_login_id` varchar(40) DEFAULT NULL,
  `offering_id` int NOT NULL,
  `attend_dt` date NOT NULL,
  `file_name` varchar(200) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `attendancephoto_offering_id_attend_dt_file_name` (`offering_id`,`attend_dt`,`file_name`),
  KEY `attendancephoto_txn_no` (`txn_no`),
  KEY `attendancephoto_offering_id` (`offering_id`),
  CONSTRAINT `attendancephoto_ibfk_1` FOREIGN KEY (`offering_id`) REFERENCES `courseoffering` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- aims_db.coursecategory definition

CREATE TABLE `coursecategory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_deleted` tinyint(1) NOT NULL,
  `txn_no` int NOT NULL,
  `ins_ts` datetime NOT NULL,
  `upd_ts` datetime NOT NULL,
  `txn_login_id` varchar(40) DEFAULT NULL,
  `offering_id` int DEFAULT NULL,
  `degree` varchar(20) NOT NULL,
  `dept` varchar(4) DEFAULT NULL,
  `category` varchar(4) DEFAULT NULL,
  `for_entry_years` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `coursecategory_offering_id_degree_dept_category` (`offering_id`,`degree`,`dept`,`category`),
  KEY `coursecategory_txn_no` (`txn_no`),
  KEY `coursecategory_offering_id` (`offering_id`),
  CONSTRAINT `coursecategory_ibfk_1` FOREIGN KEY (`offering_id`) REFERENCES `courseoffering` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- aims_db.courseenrollment definition

CREATE TABLE `courseenrollment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_deleted` tinyint(1) NOT NULL,
  `txn_no` int NOT NULL,
  `ins_ts` datetime NOT NULL,
  `upd_ts` datetime NOT NULL,
  `txn_login_id` varchar(40) DEFAULT NULL,
  `course_offering_id` int NOT NULL,
  `student_id` int NOT NULL,
  `enrol_type` varchar(20) NOT NULL,
  `enrol_status` varchar(10) NOT NULL,
  `grade` varchar(2) NOT NULL,
  `current_score` float DEFAULT NULL,
  `remarks` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `courseenrollment_student_id_course_offering_id` (`student_id`,`course_offering_id`),
  KEY `courseenrollment_txn_no` (`txn_no`),
  KEY `courseenrollment_course_offering_id` (`course_offering_id`),
  KEY `courseenrollment_student_id` (`student_id`),
  CONSTRAINT `courseenrollment_ibfk_1` FOREIGN KEY (`course_offering_id`) REFERENCES `courseoffering` (`id`) ON DELETE CASCADE,
  CONSTRAINT `courseenrollment_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1179 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- aims_db.courseinstructor definition

CREATE TABLE `courseinstructor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_deleted` tinyint(1) NOT NULL,
  `txn_no` int NOT NULL,
  `ins_ts` datetime NOT NULL,
  `upd_ts` datetime NOT NULL,
  `txn_login_id` varchar(40) DEFAULT NULL,
  `offering_id` int DEFAULT NULL,
  `instructor_id` int DEFAULT NULL,
  `is_coordinator` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `courseinstructor_offering_id_instructor_id` (`offering_id`,`instructor_id`),
  KEY `courseinstructor_txn_no` (`txn_no`),
  KEY `courseinstructor_offering_id` (`offering_id`),
  KEY `courseinstructor_instructor_id` (`instructor_id`),
  CONSTRAINT `courseinstructor_ibfk_1` FOREIGN KEY (`offering_id`) REFERENCES `courseoffering` (`id`) ON DELETE SET NULL,
  CONSTRAINT `courseinstructor_ibfk_2` FOREIGN KEY (`instructor_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- aims_db.courseinstructorfeedback definition

CREATE TABLE `courseinstructorfeedback` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_deleted` tinyint(1) NOT NULL,
  `txn_no` int NOT NULL,
  `ins_ts` datetime NOT NULL,
  `upd_ts` datetime NOT NULL,
  `txn_login_id` varchar(40) DEFAULT NULL,
  `instructor_id` int NOT NULL,
  `question_id` int NOT NULL,
  `feedback` text NOT NULL,
  `submission_id` varchar(40) NOT NULL,
  `acad_session` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `courseinstructorfeedback_txn_no` (`txn_no`),
  KEY `courseinstructorfeedback_instructor_id` (`instructor_id`),
  KEY `courseinstructorfeedback_question_id` (`question_id`),
  CONSTRAINT `courseinstructorfeedback_ibfk_1` FOREIGN KEY (`instructor_id`) REFERENCES `courseinstructor` (`id`) ON DELETE CASCADE,
  CONSTRAINT `courseinstructorfeedback_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `feedbackquestion` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- aims_db.studentattendance definition

CREATE TABLE `studentattendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_deleted` tinyint(1) NOT NULL,
  `txn_no` int NOT NULL,
  `ins_ts` datetime NOT NULL,
  `upd_ts` datetime NOT NULL,
  `txn_login_id` varchar(40) DEFAULT NULL,
  `attend` varchar(2) NOT NULL,
  `enrollment_id` int NOT NULL,
  `attend_dt` date NOT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `studentattendance_enrollment_id_attend_dt` (`enrollment_id`,`attend_dt`),
  KEY `studentattendance_txn_no` (`txn_no`),
  KEY `studentattendance_enrollment_id` (`enrollment_id`),
  CONSTRAINT `studentattendance_ibfk_1` FOREIGN KEY (`enrollment_id`) REFERENCES `courseenrollment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8226 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- aims_db.studentfeedbackstatus definition

CREATE TABLE `studentfeedbackstatus` (
  `id` int NOT NULL AUTO_INCREMENT,
  `is_deleted` tinyint(1) NOT NULL,
  `txn_no` int NOT NULL,
  `ins_ts` datetime NOT NULL,
  `upd_ts` datetime NOT NULL,
  `txn_login_id` varchar(40) DEFAULT NULL,
  `feedback_form_id` int NOT NULL,
  `course_instructor_id` int NOT NULL,
  `student_id` int NOT NULL,
  `is_submitted` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `studentfeedbackstatus_course_instructor_id_student_id_fe_ce0120b` (`course_instructor_id`,`student_id`,`feedback_form_id`),
  KEY `studentfeedbackstatus_txn_no` (`txn_no`),
  KEY `studentfeedbackstatus_feedback_form_id` (`feedback_form_id`),
  KEY `studentfeedbackstatus_course_instructor_id` (`course_instructor_id`),
  KEY `studentfeedbackstatus_student_id` (`student_id`),
  CONSTRAINT `studentfeedbackstatus_ibfk_1` FOREIGN KEY (`feedback_form_id`) REFERENCES `feedbackform` (`id`) ON DELETE CASCADE,
  CONSTRAINT `studentfeedbackstatus_ibfk_2` FOREIGN KEY (`course_instructor_id`) REFERENCES `courseinstructor` (`id`) ON DELETE CASCADE,
  CONSTRAINT `studentfeedbackstatus_ibfk_3` FOREIGN KEY (`student_id`) REFERENCES `courseenrollment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;