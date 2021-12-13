<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { AltairContext } from '../@types/altair';
import {
  STORE_KEY_API_KEY,
  STORE_KEY_GIST_FILE,
  SyncProviders,
} from '../constant/common.enum';
import SyncProviderFactory from '../providers/SyncProviderFactory';
import CloudDownloadSolidSvg from '../assets/cloud-download-alt-solid.svg?component'
import CloudUploadSolidSvg from '../assets/cloud-upload-alt-solid.svg?component'
import SyncSolidSvg from '../assets/sync-solid.svg?component'
import QuestionSvg from '../assets/question-solid.svg?component'
import LogoSvg from '../assets/logo.svg?component'
import Dialog from './BasicDialog.vue';
import { IGistFile } from 'src/@types/gist';

export interface ISelectOption {
  label: string;
  value: IGistFile;
}

const PULL_BTN_DEFAULT = 'Download';
const PUSH_BTN_DEFAULT = 'Upload';

export default defineComponent({
  name: 'GistSync',
  components: { QuestionSvg, CloudDownloadSolidSvg, CloudUploadSolidSvg, SyncSolidSvg, LogoSvg, Dialog },
  props: {
    context: {
      type: Object as PropType<AltairContext>,
      default: null
    },
  },
  data() {
    return {
      apiKey: null as unknown as string | null,
      selectedGistFile: null as unknown as IGistFile | null,
      createNewGistFileName: '' as unknown as string,
      gistOptions: [] as ISelectOption[],
      provider: SyncProviders.GitHub,
      listProviders: SyncProviders,
      isFetchingGist: false,
      isPulling: false,
      isPushing: false,
      model: {
        body: '',
        header: '',
        isFail: false,
      },
      pullBtn: PULL_BTN_DEFAULT,
      pushBtn: PUSH_BTN_DEFAULT,
    };
  },
  computed: {
    showModel() {
      return !!this.model.body && !!this.model.header;
    },
    gistProvider() {
      const factory = new SyncProviderFactory(this.context);
      const provider = factory.getProvider(this.provider);
      return provider;
    },
  },
  watch: {
    async apiKey(newValue: string) {
      this.gistProvider.cacheSelectedApiKey(STORE_KEY_API_KEY, newValue);
      await this.loadListGistFile();
    },
    selectedGistFile(newValue: IGistFile) {
      this.gistProvider.cacheSelectedGistFile(STORE_KEY_GIST_FILE, newValue);
      this.createNewGistFileName = newValue?.displayName || '';
    },
    gistOptions(newValue: ISelectOption[]) {
      const newSelectedGistFile = newValue.find(op => op.value.gistId === this.selectedGistFile?.gistId && op.value.filename === this.selectedGistFile.filename);
      this.selectedGistFile = newSelectedGistFile?.value || null;
    },
  },
  async mounted() {
    this.selectedGistFile = this.gistProvider.getCachedGistFile(STORE_KEY_GIST_FILE);
    this.apiKey = this.gistProvider.getCachedApiKey(STORE_KEY_API_KEY);
    this.$nextTick(() => {
      // this.props.ctx.on('app-ready', () => console.log('BIRDSEYE app-ready'));
    });
  },
  methods: {
    onModelChangeState(show: boolean) {
      if (!show)
        this.model = {
          body: '',
          header: '',
          isFail: false
        }
    },
    async loadListGistFile() {
      try {
        this.isFetchingGist = true;
        if (!this.apiKey) {
          this.gistOptions = [];
          return;
        }
        const gists = await this.gistProvider.getListGistFile();

        this.gistOptions = gists.map(gistFile => ({
          label: `${gistFile.displayName} (ID: ${gistFile.gistId})`,
          value: gistFile,
        }));
      } catch (error) {
        this.gistOptions = [];
      } finally {
        this.isFetchingGist = false;
      }
    },
    onSelectedGistFile(gistFile: IGistFile) {
      this.selectedGistFile = gistFile;
    },
    async onPush() {
      try {
        this.isPushing = true;
        await this.gistProvider.uploadAltairData(this.createNewGistFileName);
        await this.loadListGistFile();
        this.model = {
          body: `Your settings upload successful`,
          header: 'Upload successful',
          isFail: false
        };
      } catch (error) {
        this.onError(error);
      } finally {
        this.isPushing = false;
      }
    },
    async onPull() {
      try {
        this.isPulling = true;
        await this.gistProvider.restoreAltairData();
        this.model = {
          body: `Your settings are up-to-date! Press CTRL + R to refresh`,
          header: 'Download successful',
          isFail: false,
        };
      } catch (error) {
        this.onError(error);
      } finally {
        this.isPulling = false;
      }
    },
    onError(error: any) {
      let errorMsg = 'API key is wrong or expired';
      if (error.response) {
        const statusCode = error.response.status;
        switch (statusCode) {
          case 401:
            errorMsg = 'API key is wrong or expired!';
            break;

          case 403:
            errorMsg = 'Access denied!';
            break;

          case 404:
            errorMsg = "The selected Gist doesn's exist or deleted";
            break;

          default:
            errorMsg = 'Please check your internet connection!';
            break;
        }
      } else if (error.request) {
        errorMsg = 'May be gist server down?!?';
      } else {
        errorMsg = error.message;
      }
      this.model = {
        body: errorMsg,
        header: 'Error',
        isFail: true
      };
    },
  },
});
</script>
<template>
  <div class="gist-sync text-theme max-w-xs">
    <div class="mt-5 md:mt-0">
      <div class="shadow overflow-hidden sm:rounded-md">
        <div class="px-4 py-5 bg-theme sm:p-6">
          <!-- Logo -->
          <div class="flex justify-center">
            <LogoSvg height="7rem"></LogoSvg>
          </div>
          <div class="grid gap-3">
            <div class="col-span-6">
              <label
                for="gistProvider"
                class="block w-fit text-xs font-medium text-indigo-500"
              >Gist Provider</label>
              <select
                id="gistProvider"
                v-model="provider"
                name="gistProvider"
                class="form-input mt-1 block w-full py-2 px-3 border border-gray-300 bg-theme rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs"
              >
                <option
                  v-for="value in listProviders"
                  :key="value"
                  :value="value"
                >{{ value[0].toUpperCase() + value.slice(1) }}</option>
              </select>
            </div>

            <div class="col-span-6">
              <label for="gistApiKey" class="block w-fit text-xs font-medium text-indigo-500">
                Gist API Key
                <a
                  href="https://github.com/settings/tokens"
                  class="relative inline-block group"
                >
                  <QuestionSvg class="w-2"></QuestionSvg>
                  <div
                    class="invisible w-fit bg-theme border border-indigo-500 text-theme text-center rounded-md px-2 py-2 absolute z-50 bottom-full left-1/2 -ml-16 group-hover:visible"
                  >Get API Key from here https://github.com/settings/tokens</div>
                </a>
              </label>
              <input
                id="gistApiKey"
                v-model.lazy="apiKey"
                type="text"
                name="gistApiKey"
                class="form-input mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-xs border-gray-300 rounded-md text-theme bg-theme"
              />
            </div>
            <div class="col-span-6">
              <label for="gistKey" class="block w-fit text-xs font-medium text-indigo-500">Gist</label>
              <select
                id="gistKey"
                v-model="selectedGistFile"
                :disabled="isFetchingGist"
                name="gistKey"
                class="form-input mt-1 block w-full py-2 px-3 border border-gray-300 bg-theme rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs"
              >
                <option :value="null">Create new...</option>
                <option
                  v-for="item in gistOptions"
                  :key="item.label"
                  :value="item.value"
                >{{ item.label }}</option>
              </select>
            </div>
            <div class="col-span-6">
              <label
                for="createNewGistFileName"
                class="block w-fit text-xs font-medium text-indigo-500"
              >Gist name</label>
              <input
                id="createNewGistFileName"
                v-model="createNewGistFileName"
                type="text"
                name="createNewGistFileName"
                class="form-input mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-xs border-gray-300 rounded-md text-theme bg-theme"
              />
            </div>
          </div>

          <div class="py-2 flex justify-end">
            <button
              class="inline-flex gap-1 justify-center py-2 px-4 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
              :disabled="isFetchingGist || isPulling"
              @click="onPull()"
            >
              <span class>
                <SyncSolidSvg v-if="isPulling" class="w-4 animate-spin"></SyncSolidSvg>
                <CloudDownloadSolidSvg v-else class="w-5"></CloudDownloadSolidSvg>
              </span>
              <span class>{{ pullBtn }}</span>
            </button>
            <button
              class="inline-flex gap-1 justify-center py-2 px-4 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              :disabled="isFetchingGist || isPushing"
              @click="onPush"
            >
              <span>
                <SyncSolidSvg v-if="isPushing" class="w-4 animate-spin"></SyncSolidSvg>
                <CloudUploadSolidSvg v-else class="w-5"></CloudUploadSolidSvg>
              </span>
              <span>{{ pushBtn }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <Dialog
      :open="showModel"
      :body-content="model.body"
      :header-content="model.header"
      :is-fail="model.isFail"
      @change="onModelChangeState($event)"
    ></Dialog>
  </div>
</template>
