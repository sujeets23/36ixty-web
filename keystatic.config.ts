import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  collections: {
    services: collection({
      label: 'Services & Activations',
      slugField: 'title',
      path: 'src/content/services/*',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Service Title' } }),
        description: fields.text({ label: 'Description', multiline: true }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'Experiential', value: 'Experiential' },
            { label: 'AI Experiential', value: 'AI Experiential' },
            { label: 'Video Activations', value: 'Video Activations' },
            { label: 'Interactive Print', value: 'Interactive Print' },
          ],
          defaultValue: 'Experiential',
        }),
      },
    }),
    caseStudies: collection({
      label: 'Case Studies',
      slugField: 'title',
      path: 'src/content/case-studies/*',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Client / Case Title' } }),
        summary: fields.text({ label: 'Summary', multiline: true }),
        featuredImage: fields.text({ label: 'Image URL' }),
      },
    }),
  },
});
