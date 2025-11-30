import React from 'react';
import { cvData } from './data';

function App() {
  const { personalInfo, summary, experience } = cvData;

  return (
    <div className="container">
      <header>
        <h1>{personalInfo.name}</h1>
        <div className="contact-info">
          <a href={`mailto:${personalInfo.email}`}>{personalInfo.email}</a>
          <span>•</span>
          <span>{personalInfo.phone}</span>
          <span>•</span>
          <a href={`https://${personalInfo.linkedin}`} target="_blank" rel="noopener noreferrer">
            {personalInfo.linkedin}
          </a>
        </div>
      </header>

      <section>
        <h2>Summary</h2>
        <p className="summary">{summary}</p>
      </section>

      <section>
        <h2>Professional Experience</h2>
        {experience.map((job, index) => (
          <div key={index} className="experience-item">
            <div className="role-header">
              <span className="company">{job.company}</span>
              <span className="location">{job.location}</span>
            </div>
            <div className="role-header">
              <span className="role">{job.role}</span>
              <span className="period">{job.period}</span>
            </div>
            <ul>
              {job.achievements.map((achievement, i) => (
                <li key={i}>{achievement}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}

export default App;
