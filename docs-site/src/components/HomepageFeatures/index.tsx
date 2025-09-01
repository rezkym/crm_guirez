import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  icon: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Clean Architecture',
    icon: '🏗️',
    description: (
      <>
        Dibangun dengan Clean Architecture untuk memastikan kode yang mudah
        dipelihara, testable, dan scalable untuk kebutuhan enterprise.
      </>
    ),
  },
  {
    title: 'Hotel Management System',
    icon: '🏨',
    description: (
      <>
        Sistem manajemen hotel lengkap dengan fitur reservasi, manajemen tamu,
        housekeeping, dan reporting yang komprehensif.
      </>
    ),
  },
  {
    title: 'RBAC Security',
    icon: '🔐',
    description: (
      <>
        Role-Based Access Control yang robust dengan JWT authentication,
        memastikan keamanan data dan akses yang tepat untuk setiap pengguna.
      </>
    ),
  },
];

function Feature({title, icon, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <div className={styles.featureIcon}>{icon}</div>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
