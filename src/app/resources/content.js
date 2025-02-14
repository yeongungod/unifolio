import { InlineCode } from "@/once-ui/components";

const person = {
  firstName: "Yeong Un",
  lastName: "Park",
  get name() {
    return `${this.firstName} ${this.lastName}`;
  },
  role: "Sound Designer",
  avatar: "/images/avatar.jpg",
  location: "Asia/Seoul", // Expecting the IANA time zone identifier, e.g., 'Europe/Vienna'
  languages: [], // optional: Leave the array empty if you don't want to display languages
};

const newsletter = {
  display: false,
  title: <>Subscribe to {person.firstName}'s Newsletter</>,
  description: (
    <>
      I occasionally write about design, technology, and share thoughts on the intersection of
      creativity and engineering.
    </>
  ),
};

const social = [
  // Links are automatically displayed.
  // Import new icons in /once-ui/icons.ts
  {
    name: "Notion",
    icon: "notion",
    link: "https://yeongungod.notion.site",
  },
  {
    name: "Youtube",
    icon: "youtube",
    link: "https://www.youtube.com/@unisound0205",
  },
  // {
  //   name: "X",
  //   icon: "x",
  //   link: "",
  // },
  {
    name: "Email",
    icon: "email",
    link: "mailto:pyu0205@naver.com",
  },
];

const home = {
  label: "Home",
  title: `박영운 포트폴리오`,
  description: `게임에 새로운 세계와 경험을 주고 싶은 사운드 디자이너 박영운입니다.`,
  headline: <>사운드 디자이너 박영운</>,
  subline: (
    <>
      게임에 새로운 세계와 경험을 주고 싶은 사운드 디자이너 박영운입니다.
      <br /><InlineCode>UAD</InlineCode>, <InlineCode>Waves</InlineCode>, <InlineCode>Izotope</InlineCode> 등의 플러그인을 사용하며
      <br />메인 DAW로는 <InlineCode>Pro Tools</InlineCode>, <InlineCode>Cubase</InlineCode>를 사용하고 있습니다.
    </>
  ),
};

const about = {
  label: "About",
  title: "박영운 포트폴리오",
  description: `게임에 새로운 세계와 경험을 주고 싶은 사운드 디자이너 박영운입니다.`,
  tableOfContent: {
    display: true,
    subItems: false,
  },
  avatar: {
    display: true,
  },
  calendar: {
    display: false,
    link: "https://cal.com",
  },
  intro: {
    display: true,
    title: "자기소개",
    description: (
      <>
      게임에 새로운 세계와 경험을 주고 싶은 사운드 디자이너 박영운입니다.
      </>
    ),
  },
  work: {
    display: true, // set to false to hide this section
    title: "경력사항",
    experiences: [
      {
        company: "사운드 디자이너",
        timeframe: "2018 - Present",
        role: "프리랜서",
        achievements: [
          <>
            독립영화 '침묵' 사운드디자인/믹싱 수행 - 제18회 대한민국대학영화제(최우수작품상, 여자연기상)
          </>,
          <>
            '대한민국 해군', '한국연예제작자협회' 외 약 40여편 웹 콘텐츠 동시녹음/사운드디자인/믹싱 수행
         </>,
         <>
            'RAPBEAT', 'Deepshower, 펀치넬로’, '곽태풍' - 라이브, M/V 녹음/사운드디자인/믹싱/마스터링 수행
        </>,
          <>
            '수련수련', '마젠타', '해나', '고라니율' 팬미팅 사운드 오퍼레이팅 수행
          </>,
          <>
            그 외 다수
        </>,

        ],
        images: [
          // optional: leave the array empty if you don't want to display images
          {
            src: "/images/projects/project-01/cover-01.jpg",
            alt: "Once UI Project",
            width: 16,
            height: 9,
          },
        ],
      },
      {
        company: "레이븐어스",
        timeframe: "2023 - 2023",
        role: "콘텐츠 제작팀 / 인턴",
        achievements: [
          <>
            SEMICS 기업의 강의 영상을 편집하여 총 13편을 납품하였습니다.
          </>,
          <>
            입찰에 성공하여 한양대학교 ERICA캠퍼스에 Cubase Elements 12 30개, Novation Launchkey2 5 MK3 5대, Serum 2개를 성공적으로 납품한 성과가 있습니다.
          </>,
        ],
        images: [],
      },
    ],
  },
  studies: {
    display: true, // set to false to hide this section
    title: "학력사항",
    institutions: [
      {
        name: "서울예술대학교 (2019-2024)",
        description: <>방송영상과 음향전공으로 사운드를 공부했습니다.</>,
      },
      {
        name: "용문고등학교 (2016-2019)",
        description: <>이공계를 졸업했습니다.</>,
      },
    ],
  },

    certificate: {
      display: true, // set to false to hide this section
      title: "자격증",
      experiences: [
        {
          company: "Pro Tools 110",
          timeframe: "2025",
          role: "Avid",
        },
        {
          company: "Pro Tools 101",
          timeframe: "2023",
          role: "Avid",
        },
        {
          company: "ACA Premiere CC 2015",
          timeframe: "2020",
          role: "Adobe",
        },
        {
          company: "ACA Illustrator CC 2015",
          timeframe: "2020",
          role: "Avobe",
        },
      ],
    },
  technical: {
    display: true, // set to false to hide this section
    title: "보유 기술",
    skills: [
      {
        title: "Pro Tools",
        description: <>메인으로 사용하는 DAW로, 믹싱/마스터링에 주로 사용합니다.</>,
        // optional: leave the array empty if you don't want to display images
        // images: [
        //   {
        //     src: "/images/projects/project-01/cover-02.jpg",
        //     alt: "Project image",
        //     width: 16,
        //     height: 9,
        //   },
        //   {
        //     src: "/images/projects/project-01/cover-03.jpg",
        //     alt: "Project image",
        //     width: 16,
        //     height: 9,
        //   },
        // ],
      },
      {
        title: "Cubase",
        description: <>서브로 사용하는 DAW로, 사운드 디자인에 주로 사용합니다.</>,
        // optional: leave the array empty if you don't want to display images
        // images: [
        //   {
        //     src: "/images/projects/project-01/cover-04.jpg",
        //     alt: "Project image",
        //     width: 16,
        //     height: 9,
        //   },
        // ],
      },
      // {
      //   title: "Ableton Live",
      //   description: <>배우고 있는 DAW로, 아직 미숙합니다.</>,
      //   // optional: leave the array empty if you don't want to display images
      //   // images: [
      //   //   {
      //   //     src: "/images/projects/project-01/cover-04.jpg",
      //   //     alt: "Project image",
      //   //     width: 16,
      //   //     height: 9,
      //   //   },
      //   // ],
      // },
      {
        title: "Thrid-Party Plug-In",
        description: <>UAD, Waves, Izotope 등 다양한 플러그인을 사용하고 있습니다.</>,
        // optional: leave the array empty if you don't want to display images
        // images: [
        //   {
        //     src: "/images/projects/project-01/cover-04.jpg",
        //     alt: "Project image",
        //     width: 16,
        //     height: 9,
        //   },
        // ],
      },
      {
        title: "Adobe",
        description: <>사진, 영상 편집등에 사용합니다.</>,
        // optional: leave the array empty if you don't want to display images
        // images: [
        //   {
        //     src: "/images/projects/project-01/cover-04.jpg",
        //     alt: "Project image",
        //     width: 16,
        //     height: 9,
        //   },
        // ],
      },
    ],
  },
};

const blog = {
  label: "Blog",
  title: "Writing about design and tech...",
  description: `Read what ${person.name} has been up to recently`,
  // Create new blog posts by adding a new .mdx file to app/blog/posts
  // All posts will be listed on the /blog route
};

const work = {
  label: "Work",
  title: "박영운 포트폴리오",
  description: `게임에 새로운 세계와 경험을 주고 싶은 사운드 디자이너 박영운입니다.`,
  // Create new project pages by adding a new .mdx file to app/blog/posts
  // All projects will be listed on the /home and /work routes
};

const gallery = {
  label: "Gallery",
  title: "My photo gallery",
  description: `A photo collection by ${person.name}`,
  // Images from https://pexels.com
  images: [
    {
      src: "/images/gallery/img-01.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/img-02.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img-03.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/img-04.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img-05.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img-06.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/img-07.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img-08.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/img-09.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img-10.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img-11.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/img-12.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img-13.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/img-14.jpg",
      alt: "image",
      orientation: "horizontal",
    },
  ],
};

export { person, social, newsletter, home, about, blog, work, gallery };
