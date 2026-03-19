import React from 'react';
import { Button, Card } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';
import { sendTrackingLogEvent } from '@edx/frontend-platform/analytics';

import messages from '../messages';
import { useModel } from '../../../generic/model-store';

const CourseCompletedCard = () => {
  const intl = useIntl();
  const { courseId } = useSelector(state => state.courseHome);

  const { org } = useModel('courseHomeMeta', courseId);

  const courseEndUrl = `/learning/course/${courseId}/course-end`;

  const eventProperties = {
    org_key: org,
    courserun_key: courseId,
  };

  const handleCourseEndClick = () => {
    sendTrackingLogEvent('edx.course.home.course_end.clicked', {
      ...eventProperties,
      url: courseEndUrl,
    });
  };

  return (
    <Card className="mb-3 raised-card" data-testid="course-completed-card">
      <Card.Header
        title={intl.formatMessage(messages.courseFullyCompletedTitle)}
        actions={(
          <Button
            variant="brand"
            block
            href={courseEndUrl}
            onClick={handleCourseEndClick}
          >
            {intl.formatMessage(messages.goToCourseEnd)}
          </Button>
        )}
      />
      <Card.Footer><></></Card.Footer>
    </Card>
  );
};

export default CourseCompletedCard;