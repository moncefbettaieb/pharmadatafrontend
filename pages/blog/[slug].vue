<template>
  <div class="bg-white py-12">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div v-if="pending" class="text-center py-12">
        <p class="text-gray-500">Chargement de l'article...</p>
      </div>
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-500">
          Une erreur est survenue lors du chargement de l'article.
        </p>
      </div>
      <template v-else>
        <div v-if="!article" class="text-center py-12">
          <p class="text-gray-500">Article non trouvé.</p>
        </div>
        <article v-else class="max-w-4xl mx-auto">
          <div class="text-center">
            <h1
              class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
            >
              {{ article.title }}
            </h1>
            <p class="mx-auto mt-3 max-w-2xl text-xl text-gray-500 sm:mt-4">
              {{ article.description }}
            </p>
            <div class="mt-4 flex justify-center gap-2">
              <span
                v-for="tag in article.tags"
                :key="tag"
                class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
              >
                {{ tag }}
              </span>
            </div>
            <div class="mt-6 text-sm text-gray-500">
              <time :datetime="article.date">{{
                formatDate(article.date)
              }}</time>
            </div>
          </div>

          <div class="mt-12">
            <img
              v-if="article.image"
              :src="article.image"
              :alt="article.title"
              class="w-full rounded-lg shadow-lg mb-12"
            />
            <ContentRenderer :value="article" class="prose prose-lg mx-auto" />
          </div>
        </article>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAsyncData, useHead, useRoute } from "#imports";

const route = useRoute();

const {
  data: article,
  pending,
  error,
} = await useAsyncData("article", () => {
  return queryCollection("blog")
    .where("path", "=", `/blog/${route.params.slug}`)
    .all()
    .then((res) => {
      // Comme .all() retourne un tableau, on prend le premier élément
      return res[0] || null;
    })
    .catch((err) => {
      console.error("Error fetching article:", err);
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
  title: article.value?.title
    ? `${article.value.title} - PharmaData`
    : "Article - PharmaData",
  meta: [
    {
      name: "description",
      content:
        article.value?.description ||
        "Article détaillé sur la santé et les médicaments",
    },
    {
      name: "keywords",
      content:
        article.value?.tags?.join(", ") || "santé, pharmacie, médicaments",
    },
    {
      property: "og:title",
      content: article.value?.title || "Article - PharmaData",
    },
    {
      property: "og:description",
      content:
        article.value?.description ||
        "Article détaillé sur la santé et les médicaments",
    },
    { property: "og:type", content: "article" },
    {
      property: "og:image",
      content: article.value?.image || "/images/blog-banner.jpg",
    },
    { name: "twitter:card", content: "summary_large_image" },
    {
      name: "twitter:title",
      content: article.value?.title || "Article - PharmaData",
    },
    {
      name: "twitter:description",
      content:
        article.value?.description ||
        "Article détaillé sur la santé et les médicaments",
    },
  ],
});
</script>
