<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h1 class="text-2xl font-semibold leading-6 text-gray-900 mb-8">
            Ajouter une nouvelle fiche produit
          </h1>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Informations de base -->
            <div class="border-b border-gray-200 pb-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4">
                Informations de base
              </h2>
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    for="cip_code"
                    class="block text-sm font-medium text-gray-700"
                    >Code CIP*</label
                  >
                  <input
                    type="text"
                    id="cip_code"
                    v-model="formData.cip_code"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    for="brand"
                    class="block text-sm font-medium text-gray-700"
                    >Marque*</label
                  >
                  <input
                    type="text"
                    id="brand"
                    v-model="formData.brand"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div class="sm:col-span-2">
                  <label
                    for="title"
                    class="block text-sm font-medium text-gray-700"
                    >Titre du produit*</label
                  >
                  <input
                    type="text"
                    id="title"
                    v-model="formData.title"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <!-- Catégorisation -->
            <div class="border-b border-gray-200 pb-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4">
                Catégorisation
              </h2>
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    for="category"
                    class="block text-sm font-medium text-gray-700"
                    >Catégorie*</label
                  >
                  <input
                    type="text"
                    id="category"
                    v-model="formData.category"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    for="sub_category1"
                    class="block text-sm font-medium text-gray-700"
                    >Sous-catégorie 1</label
                  >
                  <input
                    type="text"
                    id="sub_category1"
                    v-model="formData.sub_category1"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    for="sub_category2"
                    class="block text-sm font-medium text-gray-700"
                    >Sous-catégorie 2</label
                  >
                  <input
                    type="text"
                    id="sub_category2"
                    v-model="formData.sub_category2"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    for="sub_category3"
                    class="block text-sm font-medium text-gray-700"
                    >Sous-catégorie 3</label
                  >
                  <input
                    type="text"
                    id="sub_category3"
                    v-model="formData.sub_category3"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="border-b border-gray-200 pb-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4">
                Description
              </h2>
              <div class="space-y-6">
                <div>
                  <label
                    for="short_desc"
                    class="block text-sm font-medium text-gray-700"
                    >Description courte*</label
                  >
                  <textarea
                    id="short_desc"
                    v-model="formData.short_desc"
                    rows="2"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  ></textarea>
                </div>

                <div>
                  <label
                    for="long_desc"
                    class="block text-sm font-medium text-gray-700"
                    >Description détaillée</label
                  >
                  <textarea
                    id="long_desc"
                    v-model="formData.long_desc"
                    rows="4"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Informations techniques -->
            <div class="border-b border-gray-200 pb-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4">
                Informations techniques
              </h2>
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    for="age_minimum"
                    class="block text-sm font-medium text-gray-700"
                    >Âge minimum</label
                  >
                  <input
                    type="text"
                    id="age_minimum"
                    v-model="formData.age_minimum"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    for="nombre_d_unites"
                    class="block text-sm font-medium text-gray-700"
                    >Nombre d'unités</label
                  >
                  <input
                    type="text"
                    id="nombre_d_unites"
                    v-model="formData.nombre_d_unites"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div class="sm:col-span-2">
                  <label
                    for="composition"
                    class="block text-sm font-medium text-gray-700"
                    >Composition</label
                  >
                  <textarea
                    id="composition"
                    v-model="formData.composition"
                    rows="3"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  ></textarea>
                </div>

                <div class="sm:col-span-2">
                  <label
                    for="posologie"
                    class="block text-sm font-medium text-gray-700"
                    >Posologie</label
                  >
                  <textarea
                    id="posologie"
                    v-model="formData.posologie"
                    rows="3"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  ></textarea>
                </div>

                <div class="sm:col-span-2">
                  <label
                    for="contre_indication"
                    class="block text-sm font-medium text-gray-700"
                    >Contre-indications</label
                  >
                  <textarea
                    id="contre_indication"
                    v-model="formData.contre_indication"
                    rows="3"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Images -->
            <div>
              <h2 class="text-lg font-medium text-gray-900 mb-4">
                Images du produit
              </h2>
              <div
                class="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10"
              >
                <div class="text-center">
                  <svg
                    class="mx-auto h-12 w-12 text-gray-300"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <div class="mt-4 flex text-sm leading-6 text-gray-600">
                    <label
                      for="file-upload"
                      class="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                    >
                      <span>Télécharger un fichier</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        class="sr-only"
                        accept="image/*"
                        multiple
                        @change="handleFileUpload"
                      />
                    </label>
                    <p class="pl-1">ou glisser-déposer</p>
                  </div>
                  <p class="text-xs leading-5 text-gray-600">
                    PNG, JPG jusqu'à 10MB
                  </p>
                </div>
              </div>
            </div>

            <!-- Preview des images -->
            <div
              v-if="selectedFiles.length > 0"
              class="grid grid-cols-2 sm:grid-cols-3 gap-4"
            >
              <div
                v-for="(file, index) in selectedFiles"
                :key="index"
                class="relative"
              >
                <img
                  :src="previewUrls[index]"
                  class="w-full h-32 object-cover rounded-lg"
                />
                <button
                  @click="removeFile(index)"
                  class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="resetForm"
                class="rounded-md bg-white py-2 px-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Réinitialiser
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              >
                {{ loading ? "Envoi en cours..." : "Envoyer" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useToast } from "vue-toastification";

const toast = useToast();
const loading = ref(false);
const selectedFiles = ref([]);
const previewUrls = ref([]);

const formData = ref({
  cip_code: "",
  brand: "",
  title: "",
  category: "",
  sub_category1: "",
  sub_category2: "",
  sub_category3: "",
  short_desc: "",
  long_desc: "",
  age_minimum: "",
  nombre_d_unites: "",
  composition: "",
  posologie: "",
  contre_indication: "",
});

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files);

  // Vérifier la taille des fichiers
  const validFiles = files.filter((file) => {
    if (file.size > 10 * 1024 * 1024) {
      // 10MB
      toast.error(`Le fichier ${file.name} est trop volumineux. Maximum 10MB.`);
      return false;
    }
    return true;
  });

  selectedFiles.value = [...selectedFiles.value, ...validFiles];

  // Créer les URLs de preview
  validFiles.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewUrls.value.push(e.target.result);
    };
    reader.readAsDataURL(file);
  });
};

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
  previewUrls.value.splice(index, 1);
};

const resetForm = () => {
  formData.value = {
    cip_code: "",
    brand: "",
    title: "",
    category: "",
    sub_category1: "",
    sub_category2: "",
    sub_category3: "",
    short_desc: "",
    long_desc: "",
    age_minimum: "",
    nombre_d_unites: "",
    composition: "",
    posologie: "",
    contre_indication: "",
  };
  selectedFiles.value = [];
  previewUrls.value = [];
};

const handleSubmit = async () => {
  loading.value = true;
  try {
    // TODO: Implémenter la logique d'envoi des données
    console.log("Données du formulaire:", formData.value);
    console.log("Fichiers sélectionnés:", selectedFiles.value);

    toast.success("Fiche produit ajoutée avec succès");
    resetForm();
  } catch (error) {
    console.error("Erreur lors de l'ajout de la fiche produit:", error);
    toast.error("Erreur lors de l'ajout de la fiche produit");
  } finally {
    loading.value = false;
  }
};

// Protection de la route
definePageMeta({
  middleware: ['auth-verified'],
});
</script>
