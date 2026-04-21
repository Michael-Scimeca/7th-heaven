import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'video',
  title: 'Video',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'youtubeId',
      title: 'YouTube ID',
      type: 'string',
      description: 'The 11-character hash found in the YouTube URL (e.g. dQw4w9WgXcQ)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Official Music Videos', value: 'Official Music Videos' },
          { title: 'TV Appearances', value: 'TV Appearances' },
          { title: 'Full Concerts', value: 'Full Concerts' },
          { title: 'Cover Songs', value: 'Cover Songs' },
          { title: 'Songs In Movies & TV', value: 'Songs In Movies & TV' },
          { title: 'Cruise Videos', value: 'Cruise Videos' },
          { title: 'College Shows', value: 'College Shows' },
          { title: 'Live Footage', value: 'Live Footage' },
          { title: "Medley's", value: "Medley's" },
          { title: 'Misc. / Various', value: 'Misc. / Various' },
          { title: 'Live Feeds', value: 'Live Feeds' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'e.g. 3:35 or 1:15:05',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'viewCount',
      title: 'View Count',
      type: 'string',
      description: 'e.g. 2.4K',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      youtubeId: 'youtubeId',
    },
    prepare(selection) {
      const { title, subtitle, youtubeId } = selection
      return {
        title: title,
        subtitle: subtitle,
        imageUrl: youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : undefined
      }
    }
  }
})
