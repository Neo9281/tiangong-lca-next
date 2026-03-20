import { getLang, getLangText } from '@/services/general/util';
import styles from '@/style/custom.less';
import {
  ApartmentOutlined,
  BuildOutlined,
  DeploymentUnitOutlined,
  GlobalOutlined,
  InteractionOutlined,
  ProductOutlined,
  ShareAltOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Modal,
  Row,
  Space,
  Spin,
  Statistic,
  StatisticProps,
  Typography,
  theme,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

import { getThumbFileUrls } from '@/services/supabase/storage';
import { getTeams } from '@/services/teams/api';
import { PageContainer } from '@ant-design/pro-components';
import CountUp from 'react-countup';
import { FormattedMessage, useIntl } from 'umi';

const Welcome: React.FC = () => {
  const { token } = theme.useToken();
  const { Meta } = Card;

  const intl = useIntl();
  const { locale } = intl;
  const lang = getLang(locale) as 'en' | 'zh';
  const primaryColor = `var(--ant-color-primary, ${token.colorPrimary})`;

  const isDarkMode = localStorage.getItem('isDarkMode') === 'true';

  const [teams, setTeams] = React.useState<any>(null);
  const [teamsCount, setTeamsCount] = React.useState<number>(0);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isTeamsLoading, setIsTeamsLoading] = useState(false);
  const [modalWidth, setModalWidth] = useState(720);
  const [isTidasModalOpen, setIsTidasModalOpen] = useState(false);

  const handleOpenDataModal = React.useCallback(
    (event?: React.MouseEvent<HTMLElement>) => {
      event?.preventDefault();
      setIsDataModalOpen(true);
    },
    [setIsDataModalOpen],
  );

  const loadTeams = React.useCallback(async () => {
    if (teams || isTeamsLoading) {
      return;
    }
    setIsTeamsLoading(true);
    try {
      const res = await getTeams();
      if (res?.data && res.data.length > 0) {
        const processTeams = [...res.data];
        const promises = processTeams.map(async (team, index) => {
          if (team.json?.lightLogo) {
            const thumbResult = await getThumbFileUrls([{ '@uri': `${team.json.lightLogo}` }]);
            if (thumbResult[0]?.status === 'done') {
              processTeams[index].json.previewLightUrl = thumbResult[0].thumbUrl;
            }
          }
          if (team.json?.darkLogo) {
            const thumbResult = await getThumbFileUrls([{ '@uri': `${team.json.darkLogo}` }]);
            if (thumbResult[0]?.status === 'done') {
              processTeams[index].json.previewDarkUrl = thumbResult[0].thumbUrl;
            }
          }
          return team;
        });

        await Promise.all(promises);
        setTeams(processTeams);
      } else {
        setTeams(res?.data);
      }
    } finally {
      setIsTeamsLoading(false);
    }
  }, [isTeamsLoading, teams]);

  const getTeamCount = async () => {
    const res = await getTeams();
    setTeamsCount(res?.data?.length ?? 0);
  };

  useEffect(() => {
    if (isDataModalOpen) {
      loadTeams();
    } else {
      getTeamCount();
    }
  }, [isDataModalOpen, loadTeams]);

  useEffect(() => {
    if (!isDataModalOpen && !isTidasModalOpen) {
      return;
    }
    const resize = () => {
      if (typeof window === 'undefined') {
        return;
      }
      const maxWidth = 1024;
      const horizontalGap = 48;
      const preferredWidth = Math.min(Math.max(window.innerWidth - horizontalGap, 0), maxWidth);
      const fallbackWidth = Math.min(window.innerWidth, maxWidth);
      setModalWidth(preferredWidth > 0 ? preferredWidth : fallbackWidth);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [isDataModalOpen, isTidasModalOpen]);

  const formatter: StatisticProps['formatter'] = (value) => (
    <CountUp end={value as number} separator=',' />
  );

  type SectionKey =
    | 'internationalMethodology'
    | 'ecosystemInteroperability'
    | 'architectureExtensibility'
    | 'modelingTraceability';

  const sectionIconMap: Record<SectionKey, React.ReactNode> = {
    internationalMethodology: <GlobalOutlined />,
    ecosystemInteroperability: <InteractionOutlined />,
    architectureExtensibility: <DeploymentUnitOutlined />,
    modelingTraceability: <ApartmentOutlined />,
  };

  const metrics = [
    {
      key: 'data1',
      icon: <ShareAltOutlined />,
      title: intl.formatMessage({
        id: 'pages.welcome.metrics.unitProcesses',
        defaultMessage: 'Unit Processes & Inventories',
      }),
      value: 12320,
    },
    {
      key: 'data2',
      icon: <BuildOutlined />,
      title: intl.formatMessage({
        id: 'pages.welcome.metrics.domains',
        defaultMessage: 'Domains / Sectors',
      }),
      value: 78,
    },
    {
      key: 'data3',
      icon: <ProductOutlined />,
      title: intl.formatMessage({
        id: 'pages.welcome.metrics.products',
        defaultMessage: 'Products',
      }),
      value: 2670,
    },
    {
      key: 'data4',
      icon: <UserOutlined />,
      title: intl.formatMessage({
        id: 'pages.welcome.metrics.contributors',
        defaultMessage: 'Global Contributors',
      }),
      value: 170,
    },
    {
      key: 'data5',
      icon: <TeamOutlined />,
      title: intl.formatMessage({
        id: 'pages.welcome.metrics.teams',
        defaultMessage: 'Data Teams',
      }),
      value: teamsCount,
    },
  ];
  const currentContent = {
    intro: intl.formatMessage({
      id: 'pages.welcome.tidas.intro',
      defaultMessage:
        'TianGong LCA Data Platform is an open platform for lifecycle assessment and product carbon management. Based on the TianGong LCA Data System (TIDAS), it is founded on three key principles: standardization, interoperability, and extensibility. Our mission is to achieve four core objectives in carbon data management: regulatory compliance, global interoperability, verifiable results, and robust data security.',
    }),
    sections: [
      {
        key: 'internationalMethodology' as SectionKey,
        heading: intl.formatMessage({
          id: 'pages.welcome.tidas.sections.internationalMethodology.heading',
          defaultMessage: 'Standards & Compliance',
        }),
        description: intl.formatMessage({
          id: 'pages.welcome.tidas.sections.internationalMethodology.description',
          defaultMessage:
            'The platform integrates internationally recognized LCA methodologies, including ISO, ILCD, GHG Protocol, and national standards. Its calculation processes and data structures strictly adhere to these guidelines to ensure the transparency, comparability, and reproducibility of all analysis results.',
        }),
      },
      {
        key: 'ecosystemInteroperability' as SectionKey,
        heading: intl.formatMessage({
          id: 'pages.welcome.tidas.sections.ecosystemInteroperability.heading',
          defaultMessage: 'Openness & Interoperability',
        }),
        description: intl.formatMessage({
          id: 'pages.welcome.tidas.sections.ecosystemInteroperability.description',
          defaultMessage:
            'Based on the unified TIDAS format, the platform offers native compatibility with the eILCD data structure. This allows for seamless data import and export, ensuring usability across other mainstream LCA tools that support the eILCD format.',
        }),
      },
      {
        key: 'architectureExtensibility' as SectionKey,
        heading: intl.formatMessage({
          id: 'pages.welcome.tidas.sections.architectureExtensibility.heading',
          defaultMessage: 'Intelligence & Security',
        }),
        description: intl.formatMessage({
          id: 'pages.welcome.tidas.sections.architectureExtensibility.description',
          defaultMessage:
            'The platform embeds AI algorithms to assist in data modeling and validation. Its modular architecture also supports the integration of cutting-edge technologies like blockchain and privacy-enhancing computation (PEC) to ensure the integrity and confidentiality of enterprise data.',
        }),
      },
      {
        key: 'modelingTraceability' as SectionKey,
        heading: intl.formatMessage({
          id: 'pages.welcome.tidas.sections.modelingTraceability.heading',
          defaultMessage: 'Modeling & Traceability',
        }),
        description: intl.formatMessage({
          id: 'pages.welcome.tidas.sections.modelingTraceability.description',
          defaultMessage:
            'Traceable modeling for complex production systems links process datasets and model datasets bidirectionally, covering multi-product, multi-destination, and recycle scenarios so product pathways and allocation logic remain transparent. Model the plant once and output impacts for every product and by-product straight away.',
        }),
      },
    ],
  };
  const modalSubtitle = intl.formatMessage({
    id: 'pages.welcome.dataEcosystem.subtitle',
    defaultMessage: 'A global network of lifecycle data partners.',
  });

  const tidasTitle = intl.formatMessage({
    id: 'pages.welcome.tidas.title',
    defaultMessage: 'TIDAS Architecture',
  });
  const tidasDescription = intl.formatMessage({
    id: 'pages.welcome.tidas.description',
    defaultMessage:
      'An open ecosystem of modular data packs, APIs, and toolkits enabling collaborative, verifiable exchanges.',
  });
  const tidasDocUrl =
    lang === 'zh'
      ? 'https://tidas.tiangong.earth/docs/intro'
      : 'https://tidas.tiangong.earth/en/docs/intro';
  const tidasReadMoreLabel = intl.formatMessage({
    id: 'pages.welcome.tidas.readMore',
    defaultMessage: 'Learn more',
  });
  const tidasImageSrc =
    lang === 'zh'
      ? isDarkMode
        ? '/images/tidas/TIDAS-zh-CN-dark.svg'
        : '/images/tidas/TIDAS-zh-CN.svg'
      : isDarkMode
        ? '/images/tidas/TIDAS-en-dark.svg'
        : '/images/tidas/TIDAS-en.svg';
  const tidasImageAlt = currentContent.intro;

  const WELCOME_RADIUS = 8;

  const cardBorderRadiusStyle = useMemo(() => ({ borderRadius: WELCOME_RADIUS }), []);

  const modalStyles = useMemo(() => ({ content: { borderRadius: WELCOME_RADIUS } }), []);

  return (
    <PageContainer title={false} className={styles.welcome_page}>
      <Space direction='vertical' size={24} className={styles.welcome_content}>
        <Row gutter={[16, 16]} wrap>
          {metrics.map((metric) => (
            <Col key={metric.key} flex='1 0 200px' style={{ display: 'flex' }}>
              <Card
                className={`${styles.welcome_card} ${styles.welcome_metrics_card}`}
                styles={{
                  body: { padding: 20, height: '100%', display: 'flex', flexDirection: 'column' },
                }}
                style={{ ...cardBorderRadiusStyle, width: '100%' }}
              >
                <div className={styles.welcome_metric_content}>
                  <div className={styles.welcome_metric_header}>
                    <span className={styles.welcome_metric_icon} style={{ color: primaryColor }}>
                      {metric.icon}
                    </span>
                    {metric.key === 'data5' ? (
                      <Typography.Link
                        strong
                        href='#'
                        onClick={handleOpenDataModal}
                        style={{
                          color: primaryColor,
                          fontFamily: `'Inter', 'Helvetica Neue', Arial, sans-serif`,
                          fontWeight: 600,
                          fontSize: '1rem',
                        }}
                      >
                        {metric.title}
                      </Typography.Link>
                    ) : (
                      <Typography.Text
                        strong
                        style={{
                          color: primaryColor,
                          fontFamily: `'Inter', 'Helvetica Neue', Arial, sans-serif`,
                          fontWeight: 600,
                          fontSize: '1rem',
                        }}
                      >
                        {metric.title}
                      </Typography.Text>
                    )}
                  </div>
                  <Statistic
                    value={metric.value}
                    formatter={formatter}
                    valueStyle={{
                      fontSize: '1.25rem',
                      color: token.colorText,
                      lineHeight: 1.1,
                      fontFamily: `'Inter', 'Helvetica Neue', Arial, sans-serif`,
                    }}
                    style={{ width: '100%', textAlign: 'center' }}
                  />
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <Card
          className={styles.welcome_card}
          styles={{ body: { padding: 24 } }}
          style={cardBorderRadiusStyle}
        >
          <Space direction='vertical' size={16} style={{ width: '100%' }}>
            <Typography.Paragraph
              style={{
                margin: 0,
                color: token.colorText,
                fontSize: '1rem',
                lineHeight: 1.7,
              }}
            >
              {currentContent.intro}
            </Typography.Paragraph>
            <Space size={12} wrap>
              <Button type='primary' onClick={() => setIsTidasModalOpen(true)}>
                {intl.formatMessage({
                  id: 'pages.welcome.actions.tidas',
                  defaultMessage: 'TIDAS Architecture',
                })}
              </Button>
              <Button onClick={handleOpenDataModal}>
                {intl.formatMessage({
                  id: 'pages.welcome.actions.dataEcosystem',
                  defaultMessage: 'TianGong Data Ecosystem',
                })}
              </Button>
            </Space>
          </Space>
        </Card>

        <Row gutter={[16, 16]} align='stretch'>
          {currentContent.sections.map((section) => (
            <Col xs={24} md={12} key={section.key}>
              <Card
                className={`${styles.welcome_card} ${styles.welcome_section_card}`}
                styles={{ body: { padding: 24 } }}
                style={cardBorderRadiusStyle}
              >
                <Space direction='vertical' size={12}>
                  <div className={styles.welcome_section_header}>
                    <span className={styles.welcome_section_icon} style={{ color: primaryColor }}>
                      {sectionIconMap[section.key]}
                    </span>
                    <Typography.Text
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        lineHeight: '20px',
                        fontSize: '1rem',
                        margin: 0,
                      }}
                    >
                      {section.heading}
                    </Typography.Text>
                  </div>
                  <Typography.Paragraph style={{ margin: 0, color: token.colorTextSecondary }}>
                    {section.description}
                  </Typography.Paragraph>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Space>
      <Modal
        open={isDataModalOpen}
        onCancel={() => setIsDataModalOpen(false)}
        footer={null}
        width={modalWidth}
        destroyOnHidden
        styles={modalStyles}
        title={<FormattedMessage id='pages.dataEcosystem' defaultMessage='Data Ecosystem' />}
      >
        <Space direction='vertical' size={16} style={{ width: '100%' }}>
          <Typography.Paragraph style={{ margin: 0, color: token.colorTextSecondary }}>
            {modalSubtitle}
          </Typography.Paragraph>
          {isTeamsLoading ? (
            <Row justify='center' style={{ minHeight: 180 }}>
              <Spin />
            </Row>
          ) : (
            <Row gutter={[16, 16]}>
              {teams?.map((team: any, index: number) => {
                let logoUrl = '';
                if (team.json?.previewLightUrl) {
                  logoUrl = isDarkMode ? team.json?.previewDarkUrl : team.json?.previewLightUrl;
                }
                return (
                  <Col xs={24} sm={12} lg={8} key={team.id ?? index}>
                    <Card
                      hoverable
                      className={`${styles.welcome_card} ${styles.welcome_team_card}`}
                      styles={{ body: { padding: 16 } }}
                      style={cardBorderRadiusStyle}
                      cover={
                        <div className={styles.team_logo_container}>
                          {logoUrl && (
                            <img
                              src={logoUrl}
                              className={styles.team_logo}
                              alt={getLangText(team.json?.title, lang)}
                            />
                          )}
                        </div>
                      }
                      onClick={() => {
                        window.location.href = `/tgdata/models?tid=${team.id}`;
                      }}
                    >
                      <Meta
                        title={
                          <Typography.Text strong>
                            {getLangText(team.json?.title, lang)}
                          </Typography.Text>
                        }
                        description={
                          <Typography.Paragraph
                            style={{ margin: '8px 0 0', color: token.colorTextSecondary }}
                          >
                            {getLangText(team.json?.description, lang)}
                          </Typography.Paragraph>
                        }
                      />
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </Space>
      </Modal>
      <Modal
        open={isTidasModalOpen}
        onCancel={() => setIsTidasModalOpen(false)}
        footer={null}
        width={modalWidth}
        destroyOnHidden
        styles={modalStyles}
        title={tidasTitle}
      >
        <Space direction='vertical' size={16} style={{ width: '100%' }}>
          <Typography.Paragraph style={{ margin: 0, color: token.colorTextSecondary }}>
            {tidasDescription}{' '}
            <Typography.Link
              href={tidasDocUrl}
              target='_blank'
              rel='noopener noreferrer'
              style={{ fontWeight: 500 }}
            >
              {tidasReadMoreLabel}
            </Typography.Link>
          </Typography.Paragraph>
          {isTidasModalOpen && (
            <img src={tidasImageSrc} alt={tidasImageAlt} style={{ width: '100%' }} />
          )}
        </Space>
      </Modal>
    </PageContainer>
  );
};

export default Welcome;
