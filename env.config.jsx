import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '@edx/frontend-platform/react'

const config = {
  pluginSlots: {
    'org.openedx.frontend.layout.footer.v1': {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Hide,
          widgetId: 'default_contents',
        },
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_pharmacy_footer',
            type: DIRECT_PLUGIN,
            RenderWidget: () => (
              <footer style={{
                padding: '16px 48px',
                backgroundColor: '#f8f9fa',
                borderTop: '1px solid #dee2e6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '14px',
                minHeight: '80px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                  <img
                    src="/static/images/logo.png"
                    alt="ProfilUp logo"
                    style={{ height: '40px', width: 'auto' }}
                  />
                  <span style={{ color: '#6c757d', fontSize: '12px' }}>
                    Зарегистрированный товарный знак ®{new Date().getFullYear()}
                  </span>
                </div>

                <div></div>
              </footer>
            ),
          },
        },
      ]
    },
    'org.openedx.frontend.layout.header_learning.v1': {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_learning_header',
            type: DIRECT_PLUGIN,
            RenderWidget: ({ courseOrg, courseNumber, courseTitle, showUserDropdown }) => {
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

              return (
                <header className="learning-header">
                  <a className="sr-only sr-only-focusable" href="#main-content">
                    Skip to main content.
                  </a>
                  <div className="container-xl py-2 d-flex align-items-center">

                    <a
                      href={appConfig.LMS_BASE_URL + '/dashboard'}
                      className="logo d-flex align-items-center"
                      style={{ height: '100%' }}
                    >
                      <img
                        className="d-block"
                        src="/static/images/logo.png"
                        alt="Лого компании"
                        style={{ height: '40px' }}
                      />
                    </a>

                    <div className="flex-grow-1 course-title-lockup d-flex align-items-center" style={{ lineHeight: 1 }}>
                      <div style={{ minWidth: 0 }}>
                        <span className="d-block small m-0">
                          {courseOrg} {courseNumber}
                        </span>
                        <span className="d-block m-0 font-weight-bold course-title">
                          {courseTitle}
                        </span>
                      </div>
                    </div>

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
                            Панель управления
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
            },
          },
        },
      ]
    }
  },
}

export default config;