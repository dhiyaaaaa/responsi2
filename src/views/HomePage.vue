<template> 
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Home</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" :pull-factor="0.5" :pull-min="100" :pull-max="200" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="scrollable-container">
        <ion-list>
          <ion-item-sliding v-for="mainan in mainans" :key="mainan.id" :ref="(el) => setItemRef(el, mainan.id!)">
            <ion-item-options side="start" @ionSwipe="handleDelete(mainan)">
              <ion-item-option color="danger" expandable @click="handleDelete(mainan)">
                <ion-icon slot="icon-only" :icon="trash" size="large"></ion-icon>
              </ion-item-option>
            </ion-item-options>

            <ion-item>
              <ion-card>
                <ion-card-header>
                  <ion-card-title class="ion-text-wrap limited-text">{{ mainan.nama }}</ion-card-title>
                  <ion-card-subtitle class="limited-text">{{ mainan.description }}</ion-card-subtitle>
                </ion-card-header>

                <ion-card-content>
                  <ion-badge>{{ getRelativeTime(mainan.updatedAt) }}</ion-badge>
                </ion-card-content>
              </ion-card>
            </ion-item>

            <ion-item-options side="end">
              <ion-item-option @click="handleEdit(mainan)">
                <ion-icon slot="icon-only" :icon="create" size="large"></ion-icon>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
          <ion-item v-if="mainans.length === 0" class="ion-text-center">
            <ion-label>Belum ada mainan</ion-label>
          </ion-item>
        </ion-list>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="isOpen = true;">
          <ion-icon :icon="add" size="large"></ion-icon>
        </ion-fab-button>
      </ion-fab>
      <InputModal v-model:isOpen="isOpen" v-model:editingId="editingId" :mainan="mainan" @submit="handleSubmit" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonIcon,
  IonFab,
  IonFabButton,
  IonLabel,
  IonList,
  loadingController,
  IonRefresher,
  IonRefresherContent,
  toastController
} from '@ionic/vue';
import {
  add,
  create,
  trash,
  closeCircle,
  warningOutline
} from 'ionicons/icons';
import InputModal from '@/components/InputModal.vue';
import { onMounted, ref, onUnmounted } from 'vue';
import { firestoreService, type Mainan } from '@/utils/firestore';
import { formatDistanceToNow } from 'date-fns';

const isOpen = ref(false);
const editingId = ref<string | null>(null);
const mainans = ref<Mainan[]>([]);
const mainan = ref<Omit<Mainan, 'id' | 'createdAt' | 'updatedAt' | 'status'>>({
  nama: '',
  description: '',
});
const itemRefs = ref<Map<string, HTMLIonItemSlidingElement>>(new Map());
let intervalId: any;
const timeUpdateTrigger = ref(0);

const setItemRef = (el: any, id: string) => {
  if (el) {
    itemRefs.value.set(id, el.$el);
  }
};

const showToast = async (message: string, color: string = 'success', icon: string) => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    color,
    position: 'top',
    icon
  });
  await toast.present();
};

const getRelativeTime = (date: any) => {
  timeUpdateTrigger.value;
  try {
    const jsDate = date?.toDate ? date.toDate() : new Date(date);
    return formatDistanceToNow(jsDate, { addSuffix: true });
  } catch (error) {
    return 'Invalid date';
  }
};

const handleRefresh = async (event: any) => {
  try {
    await loadMainans(false);
  } catch (error) {
    console.error('Error refreshing:', error);
  } finally {
    event.target.complete();
  }
};

const handleSubmit = async (mainan: Omit<Mainan, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
  if (!mainan.nama) {
    await showToast('Nama is required', 'warning', warningOutline);
    return;
  }
  try {
    if (editingId.value) {
      await firestoreService.updateMainan(editingId.value, mainan as Mainan);
      await showToast('Mainan updated successfully', 'success', 'checkmarkCircle');
    } else {
      await firestoreService.addMainan(mainan as Mainan);
      await showToast('Mainan added successfully', 'success', 'checkmarkCircle');
    }
    loadMainans();
  } catch (error) {
    await showToast('An error occurred', 'danger', closeCircle);
    console.error(error);
  } finally {
    editingId.value = null;
  }
};

const loadMainans = async (isLoading = true) => {
  let loading;
  if (isLoading) {
    loading = await loadingController.create({
      message: 'Loading...'
    });
    await loading.present();
  }

  try {
    mainans.value = await firestoreService.getMainans();
  } catch (error) {
    console.error(error);
  } finally {
    if (loading) {
      await loading.dismiss();
    }
  }
};

onMounted(() => {
  loadMainans();
  intervalId = setInterval(() => {
    timeUpdateTrigger.value++;
  }, 60000);
});

onUnmounted(() => {
  clearInterval(intervalId);
});

const handleEdit = async (editMainan: Mainan) => {
  const slidingItem = itemRefs.value.get(editMainan.id!);
  await slidingItem?.close();

  editingId.value = editMainan.id!;
  mainan.value = {
    nama: editMainan.nama,
    description: editMainan.description,
  }
  isOpen.value = true;
}

const handleDelete = async (deleteMainan: Mainan) => {
  try {
    await firestoreService.deleteMainan(deleteMainan.id!);
    await showToast('Mainan deleted successfully', 'success', 'checkmarkCircle');
    loadMainans();
  } catch (error) {
    await showToast('Failed to delete mainan', 'danger', closeCircle);
    console.error(error);
  }
};
</script>


