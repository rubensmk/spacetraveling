/* eslint-disable no-param-reassign */
/* eslint-disable react/no-danger */
/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import {
  AiOutlineCalendar,
  AiOutlineClockCircle,
  AiOutlineUser,
} from 'react-icons/ai';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const totalWords = post?.data.content.reduce((total, contentItem) => {
    total += contentItem.heading.split(' ').length;

    const words = contentItem.body.map(item => item.text.split(' ').length);

    // eslint-disable-next-line no-return-assign
    words.map(word => (total += word));
    return total;
  }, 0);

  const readTime = Math.ceil(totalWords / 200);

  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  const formattedDate = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy',
    {
      locale: ptBR,
    }
  );
  return (
    <>
      <Head>
        <title>{`${post.data.title}| spacetraveling`}</title>
      </Head>
      <Header />
      <div className={styles.banner}>
        <img src="/images/banner.png" alt="example" />
      </div>

      <main className={commonStyles.container}>
        <section className={styles.content}>
          <h1>{post?.data.title}</h1>
          <div className={styles.info}>
            <p>
              <AiOutlineCalendar />
              {formattedDate}
            </p>
            <p>
              <AiOutlineUser />
              {post?.data.author}
            </p>
            <p>
              <AiOutlineClockCircle />
              {`${readTime} min`}
            </p>
          </div>

          <div className={styles.body}>
            {post?.data.content.map(content => {
              return (
                <article key={content.heading}>
                  <h2>{content.heading}</h2>
                  <div
                    className={styles.postContent}
                    dangerouslySetInnerHTML={{
                      __html: RichText.asHtml(content.body),
                    }}
                  />
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

  return {
    props: {
      post,
    },
  };
};
