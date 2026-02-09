import React, { useEffect, useState } from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

import CourseCelebration from './CourseCelebration';
import CourseInProgress from './CourseInProgress';
import CourseNonPassing from './CourseNonPassing';
import messages from './messages';
import { unsubscribeFromGoalReminders } from './data/thunks';

import { useModel } from '../../../generic/model-store';

import { checkCourseCompletionStatus } from './data/api';

const CourseExit = () => {
  const intl = useIntl();
  const { courseId } = useSelector(state => state.courseware);

  const courseMeta = useModel('coursewareMeta', courseId);
  const {
    certificateData,
    courseExitPageIsActive,
    courseGoals,
    enrollmentMode,
    hasScheduledContent,
    isEnrolled,
    userHasPassingGrade,
  } = courseMeta;

  const homeMeta = useModel('courseHomeMeta', courseId);
  const { isMasquerading, canViewCertificate } = homeMeta;

  const [completionStatus, setCompletionStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadStatus = async () => {
      try {
        const data = await checkCourseCompletionStatus(courseId);
        if (mounted) {
          setCompletionStatus(data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Ошибка проверки статуса курса:', err);
        if (mounted) {
          setCompletionStatus({ is_complete: false, certificate_active: false });
          setIsLoading(false);
        }
      }
    };

    loadStatus();

    return () => { mounted = false; };
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">
          </span>
        </div>
      </div>
    );
  }

  // Audit users cannot fully complete a course, so we will
  // unsubscribe them from goal reminders once they reach the course exit page
  // to avoid spamming them with goal reminder emails
  if (courseGoals && enrollmentMode === 'audit' && !isMasquerading) {
    useEffect(() => {
      unsubscribeFromGoalReminders(courseId);
    }, [courseId]);
  }

  if (!courseExitPageIsActive || !isEnrolled) {
    return <Navigate to={`/course/${courseId}`} replace />;
  }

  if (hasScheduledContent) {
    return (
      <>
        <div className="row w-100 mt-2 mb-4 justify-content-end">
          <Button
            variant="outline-primary"
            href={`${getConfig().LMS_BASE_URL}/dashboard`}
          >
            {intl.formatMessage(messages.viewCoursesButton)}
          </Button>
        </div>
        <CourseInProgress />
      </>
    );
  }

  const { is_complete: materialsCompleted, certificate_active: certificateActive } = completionStatus || {
    is_complete: false,
    certificate_active: false,
  };

  let body;

  if (materialsCompleted) {
    if (!certificateActive) {
      body = <CourseCelebration certificateActive={false} />;
    } else {
      if (userHasPassingGrade === true) {
        body = <CourseCelebration certificateActive={true} />;
      } else {
        body = <CourseNonPassing reason="low_grade" />;
      }
    }
  } else {
    body = <CourseNonPassing reason="incomplete" />;
  }

  return (
    <>
      <div className="row w-100 mt-2 mb-4 justify-content-end">
        <Button
          variant="outline-primary"
          href={`${getConfig().LMS_BASE_URL}/dashboard`}
        >
          {intl.formatMessage(messages.viewCoursesButton)}
        </Button>
      </div>
      {body}
    </>
  );
};

export default CourseExit;
