import React, { useEffect, useState } from 'react';
import { Button, Card, Spinner } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useSelector } from 'react-redux';
import { sendTrackingLogEvent } from '@edx/frontend-platform/analytics';
import messages from '../messages';
import { useModel } from '../../../generic/model-store';
import { checkCourseCompletionStatus } from '../../../courseware/course/course-exit/data/api';

const StartOrResumeCourseCard = () => {
  const intl = useIntl();
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    org,
  } = useModel('courseHomeMeta', courseId);

  const eventProperties = {
    org_key: org,
    courserun_key: courseId,
  };

  const {
    resumeCourse: {
      hasVisitedCourse,
      url: resumeCourseUrl,
    },
  } = useModel('outline', courseId);

  const [isComplete, setIsComplete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchCompletion = async () => {
      try {
        const { is_complete } = await checkCourseCompletionStatus(courseId);
        if (mounted) {
          setIsComplete(is_complete);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Ошибка проверки завершённости курса в Outline:', err);
        if (mounted) {
          setIsComplete(false);
          setIsLoading(false);
        }
      }
    };

    fetchCompletion();

    return () => { mounted = false; };
  }, [courseId]);

  if (isLoading) {
    return (
      <Card className="mb-3 raised-card text-center py-3">
        <Spinner animation="border" size="sm" />
      </Card>
    );
  }

  if (isComplete === true) {
    return null;
  }

  if (!resumeCourseUrl) {
    return null;
  }

  const logResumeCourseClick = () => {
    sendTrackingLogEvent('edx.course.home.resume_course.clicked', {
      ...eventProperties,
      event_type: hasVisitedCourse ? 'resume' : 'start',
      url: resumeCourseUrl,
    });
  };

  return (
    <Card className="mb-3 raised-card" data-testid="start-resume-card">
      <Card.Header
        title={hasVisitedCourse ? intl.formatMessage(messages.resumeBlurb) : intl.formatMessage(messages.startBlurb)}
        actions={(
          <Button
            variant="brand"
            block
            href={resumeCourseUrl}
            onClick={() => logResumeCourseClick()}
          >
            {hasVisitedCourse ? intl.formatMessage(messages.resume) : intl.formatMessage(messages.start)}
          </Button>
        )}
      />
      {/* Footer is needed for internal vertical spacing to work out. If you can remove, be my guest */}
      {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
      <Card.Footer><></></Card.Footer>
    </Card>
  );
};

export default StartOrResumeCourseCard;
