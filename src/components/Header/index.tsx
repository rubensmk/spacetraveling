import Link from 'next/link';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.headerContainer}>
      <Link href="/">
        <div>
          <img src="/images/Vector.png" alt="logo" />
          <h2>
            spacetraveling<strong>.</strong>
          </h2>
        </div>
      </Link>
    </header>
  );
}
