'use client';

import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { type DocsOrderList } from '@/utils/mdxUtils';
import type { MDXComponents } from 'mdx/types';
import { Layout, Navigator, Button, Icon, CodeBlock, CodeBlockHeader, Image } from '@/components';
import { CustomLink, CustomCodeBlock, Breadcrumb, Caption, ImageWrap, Alert, Blockquote } from '@/components/docs';

// Custom components/renderers to pass to MDX.
const components: MDXComponents = {
  a: CustomLink,
  h3: (props) => <h3 className="heading" {...props} />,
  h4: (props) => <h4 className="heading" {...props} />,
  h5: (props) => <h5 className="heading" {...props} />,
  h6: (props) => <h6 className="heading" {...props} />,
  Button,
  Icon,
  pre: (props) => <CustomCodeBlock {...props} />,
  blockquote: (props) => <Blockquote {...props} />,
  img: ({ src, alt, title, width, height }) => (
    <Image src={src!} alt={alt || ''} title={title} width={width as number} height={height as number} />
  ),
  Image,
  ImageWrap,
  Breadcrumb,
  Caption,
  Alert,
  CodeBlock,
  CodeBlockHeader,
};

export default function DocsPage({ source, navList }: { source: React.ReactElement; navList: DocsOrderList }) {
  const [activeId, setActiveId] = useState<string>('');
  const [headings, setHeadings] = useState<Array<Element>>([]);
  const [headingTops, setHeadingTops] = useState<Array<{ id: string; top: number }>>([]);

  const updateHeadingPositions = useCallback(() => {
    const scrollTop = document.documentElement.scrollTop;
    const headingTops = [...headings].map((heading) => {
      const top = heading.getBoundingClientRect().top + scrollTop;
      return {
        id: heading.id,
        top,
      };
    });
    setHeadingTops(headingTops);
  }, [headings]);

  useEffect(() => {
    setHeadings(Array.from(document.querySelectorAll('.documentation_page .heading')));
  }, [source]);

  useEffect(() => {
    if (headings.length === 0) return;

    const setActiveTOCLink = () => {
      const scrollTop = document.documentElement.scrollTop;
      const yOffset = 150;

      const currentHeading =
        scrollTop < 10
          ? headingTops.find((headingTop) => {
              return scrollTop >= headingTop.top - yOffset;
            })
          : [...headingTops].reverse().find((headingTop) => {
              return scrollTop >= headingTop.top - yOffset;
            });

      setActiveId(currentHeading?.id || '');
    };

    window.addEventListener('scroll', setActiveTOCLink);
    setActiveTOCLink();
    return () => {
      window.removeEventListener('scroll', setActiveTOCLink);
    };
  }, [headings, headingTops]);

  useEffect(() => {
    updateHeadingPositions();
    document.querySelector(`.toc-item.is_active`)?.classList.remove('is_active');
    document.querySelector(`[data-heading="${activeId}"]`)?.classList.add('is_active');
  }, [activeId, updateHeadingPositions]);

  return (
    <Layout className="documentation_page">
      <Head>
        <title>Documentation · Yorkie</title>
      </Head>
      <div className="content">
        <Navigator navList={navList} />
        <section className="section">{source}</section>
      </div>
    </Layout>
  );
}
