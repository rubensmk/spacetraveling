/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { GetStaticProps } from 'next';
import { AiOutlineCalendar, AiOutlineUser } from 'react-icons/ai';
import Prismic from '@prismicio/client';
import Link from 'next/link';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';

import styles from './home.module.scss';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const formattedPost = postsPagination.results.map(post => {
    return {
      ...post,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
    };
  });

  const [posts, setPosts] = useState<Post[]>(formattedPost);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  const handleNextPage = async () => {
    if (nextPage === null) {
      return;
    }
    const postsResults = await fetch(`${nextPage}`).then(response =>
      response.json()
    );
    setNextPage(postsResults.next_page);
    postsResults.results.map(post => {
      setPosts([...posts, post]);
    });
  };
  return (
    <>
      <Header />
      <main className={commonStyles.container}>
        {posts.map(post => (
          <Link href={`post/${post.uid}`} key={post.uid}>
            <div className={styles.post}>
              <h2>{post.data.title}</h2>
              <p>{post.data.subtitle}</p>
              <div className={styles.postInfo}>
                <time>
                  <AiOutlineCalendar />
                  {post.first_publication_date}
                </time>
                <p>
                  <AiOutlineUser />
                  {post.data.author}
                </p>
              </div>
            </div>
          </Link>
        ))}
        {nextPage && (
          <button
            type="button"
            className={styles.morePosts}
            onClick={handleNextPage}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['publication.title', 'publication.content'],
      pageSize: 4,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
    },
    revalidate: 1800,
  };
};
