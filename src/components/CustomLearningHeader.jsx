import React, { useContext, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';

const CustomLearningHeader = ({ courseOrg, courseNumber, courseTitle, showUserDropdown }) => {
  const { config: appConfig, authenticatedUser } = useContext(AppContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const discoveryUrl = appConfig.DISCOVERY_API_BASE_URL ||
                      appConfig.DISCOVERY_BASE_URL ||
                      appConfig.COURSE_CATALOG_URL ||
                      `${appConfig.LMS_BASE_URL}/courses`;

  return (
    <header className="learning-header">
      <a className="sr-only sr-only-focusable" href="#main-content">
        Skip to main content.
      </a>
      <div className="container-xl py-2 d-flex align-items-center">

        <a
          href={appConfig.LMS_BASE_URL + '/dashboard'}
          className="logo d-flex align-items-center"
          style={{ height: '100%', marginRight: '1rem' }}
        >
          <img
            className="d-block"
            src={appConfig.LMS_BASE_URL + "/static/images/logo.png"}
            alt="Лого компании"
            style={{ height: '40px' }}
          />
        </a>

        <div className="course-title-lockup d-flex align-items-center" style={{ lineHeight: 1, marginRight: '1rem' }}>
          <div style={{ minWidth: 0 }}>
            <span className="d-block small m-0">
              {courseOrg} {courseNumber}
            </span>
            <span className="d-block m-0 font-weight-bold course-title">
              {courseTitle}
            </span>
          </div>
        </div>

        <nav className="d-flex align-items-center" style={{ marginRight: 'auto' }}>
          <a
            href={appConfig.LMS_BASE_URL + '/dashboard'}
            className="nav-link"
            style={{
              background: 'none',
              borderBottom: '2px solid transparent',
              color: '#374151',
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              lineHeight: '22px',
              padding: '20px 0',
              margin: '0 16px 0 0',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#111827';
              e.target.style.borderBottomColor = '#2F2F60';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#374151';
              e.target.style.borderBottomColor = 'transparent';
            }}
          >
            Моё обучение
          </a>

          <a
            href={discoveryUrl}
            className="nav-link"
            style={{
              background: 'none',
              borderBottom: '2px solid transparent',
              color: '#374151',
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              lineHeight: '22px',
              padding: '20px 0',
              margin: '0 16px 0 0',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#111827';
              e.target.style.borderBottomColor = '#2F2F60';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#374151';
              e.target.style.borderBottomColor = 'transparent';
            }}
          >
            Каталог обучения
          </a>
        </nav>

        <div className="flex-grow-1"></div>

        {showUserDropdown && authenticatedUser && (
          <div
            ref={dropdownRef}
            className={`pgn__dropdown pgn__dropdown-light user-dropdown ml-3 dropdown ${isDropdownOpen ? 'show' : ''}`}
          >
            <button
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
              aria-label="Опции пользователя"
              type="button"
              className="dropdown-toggle btn btn-outline-primary d-flex align-items-center"
              onClick={toggleDropdown}
            >
              <svg
                aria-hidden="true"
                focusable="false"
                className="svg-inline--fa fa-circle-user fa-lg d-md-none"
                role="img"
                viewBox="0 0 512 512"
              >
                <path
                  fill="currentColor"
                  d="M399 384.2C376.9 345.8 335.4 320 288 320l-64 0c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z"
                />
              </svg>
              <span data-hj-suppress="true" className="d-none d-md-inline">
                {authenticatedUser.username}
              </span>
            </button>
            <div className={`dropdown-menu-right dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
              <a href={appConfig.LMS_BASE_URL + '/dashboard'} className="pgn__dropdown-item dropdown-item">
                Моё обучение
              </a>
              <a
                href={`${appConfig.ACCOUNT_PROFILE_URL}/u/${authenticatedUser.username}`}
                className="pgn__dropdown-item dropdown-item"
              >
                Профиль
              </a>
              <a href={appConfig.ACCOUNT_SETTINGS_URL} className="pgn__dropdown-item dropdown-item">
                Учётная запись
              </a>
              <a href={appConfig.LOGOUT_URL} className="pgn__dropdown-item dropdown-item">
                Выход
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

CustomLearningHeader.propTypes = {
  courseOrg: PropTypes.string,
  courseNumber: PropTypes.string,
  courseTitle: PropTypes.string,
  showUserDropdown: PropTypes.bool,
};

CustomLearningHeader.defaultProps = {
  courseOrg: null,
  courseNumber: null,
  courseTitle: null,
  showUserDropdown: true,
};

export default CustomLearningHeader;