<template>
  <div class="bg-white py-12">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Blog Santé PharmaData
        </h1>
        <p class="mx-auto mt-3 max-w-2xl text-xl text-gray-500 sm:mt-4">
          Découvrez nos articles sur la santé, les médicaments et les actualités
          pharmaceutiques
        </p>
      </div>

      <div class="mt-12">
        <div v-if="pending" class="text-center py-12">
          <p class="text-gray-500">Chargement des articles...</p>
        </div>
        <div v-else-if="error" class="text-center py-12">
          <p class="text-red-500">
            Une erreur est survenue lors du chargement des articles.
          </p>
        </div>
        <div v-else>
          <div v-if="!posts?.length" class="text-center py-12">
            <p class="text-gray-500">
              Aucun article disponible pour le moment.
            </p>
          </div>
          <div v-else class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <article
              v-for="post in posts"
              :key="post._path"
              class="flex flex-col overflow-hidden rounded-lg shadow-lg"
            >
              <div class="flex-shrink-0">
                <img
                  class="h-48 w-full object-cover"
                  :src="post.image || '/images/blog-placeholder.jpg'"
                  :alt="post.title"
                />
              </div>
              <div class="flex flex-1 flex-col justify-between bg-white p-6">
                <div class="flex-1">
                  <p class="text-sm font-medium text-indigo-600">
                    <span>{{ post.category }}</span>
                  </p>
                  <NuxtLink
                    :to="post.path"
                    class="mt-2 block hover:text-indigo-600"
                  >
                    <p class="text-xl font-semibold text-gray-900">
                      {{ post.title }}
                    </p>
                    <p class="mt-3 text-base text-gray-500">
                      {{ post.description }}
                    </p>
                  </NuxtLink>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <span
                      v-for="tag in post.tags"
                      :key="tag"
                      class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
                <div class="mt-6 flex items-center">
                  <div class="text-sm text-gray-500">
                    <time :datetime="post.date">{{ formatDate(post.date) }}</time>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAsyncData, useHead } from '#imports';

const { data: posts, pending, error } = await useAsyncData('blog', () => {
  return queryCollection('blog')
    //.sort({ date: -1 })
    .all()
    .then((res) => {
      return res;
    })
    .catch((err) => {
      console.error('Error fetching articles:', err);
      throw err;
    });
});

const formatDate = (dateString: string) => {
  if (!dateString) return "Date non disponible";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch (error) {
    console.error("Erreur de formatage de date:", error);
    return "Date non disponible";
  }
};

useHead({
  title: "Blog Santé - PharmaData",
  meta: [
    {
      name: "description",
      content:
        "Découvrez nos articles sur la santé, les médicaments et les actualités pharmaceutiques. Restez informé des dernières actualités du monde pharmaceutique.",
    },
    {
      name: "keywords",
      content:
        "blog santé, pharmacie, médicaments, actualités pharmaceutiques, santé, bien-être",
    },
    { property: "og:title", content: "Blog Santé - PharmaData" },
    {
      property: "og:description",
      content:
        "Découvrez nos articles sur la santé, les médicaments et les actualités pharmaceutiques.",
    },
    { property: "og:type", content: "website" },
    { property: "og:image", content: "/images/blog-banner.jpg" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Blog Santé - PharmaData" },
    {
      name: "twitter:description",
      content:
        "Découvrez nos articles sur la santé, les médicaments et les actualités pharmaceutiques.",
    },
  ],
});
</script>
