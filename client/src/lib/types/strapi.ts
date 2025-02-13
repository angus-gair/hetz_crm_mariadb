export interface StrapiResponse<T> {
  data: Array<{
    id: number;
    attributes: T;
  }>;
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface GalleryImage {
  title: string;
  description: string;
  image: {
    data: {
      attributes: {
        url: string;
        alternativeText: string;
      };
    };
  };
}

export interface Testimonial {
  author: string;
  content: string;
  rating: number;
  avatar?: {
    data: {
      attributes: {
        url: string;
      };
    };
  };
}

export interface TeamMember {
  name: string;
  position: string;
  bio: string;
  image: {
    data: {
      attributes: {
        url: string;
        alternativeText: string;
      };
    };
  };
}

export interface PageContent {
  identifier: string;
  title: string;
  content: string;
  sections: Array<{
    id: string;
    title: string;
    content: string;
  }>;
}
