import { Banner } from "@/lib/api/banner/BannerService";
import { Dialog, Transition } from "@headlessui/react";
import Image from "next/image";
import { Fragment, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface BannerUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (imageBase64: string) => Promise<void>;
    banner?: Banner;
}

export default function BannerUploadModal({
    isOpen,
    onClose,
    onSubmit,
    banner
}: BannerUploadModalProps) {
    const [preview, setPreview] = useState<string | null>(banner?.imageLink || null);
    const [isLoading, setIsLoading] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif']
        },
        maxFiles: 1
    });

    const handleSubmit = async () => {
        if (!preview) return;
        
        try {
            setIsLoading(true);
            await onSubmit(preview);
            onClose();
        } catch (error) {
            console.error('Error uploading banner:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-xl font-semibold leading-6 text-gray-900 mb-4"
                                >
                                    {banner ? 'Update Banner' : 'Upload New Banner'}
                                </Dialog.Title>
                                
                                <div className="mt-4">
                                    <div
                                        {...getRootProps()}
                                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-200
                                            ${isDragActive 
                                                ? 'border-[#9747FF] bg-purple-50' 
                                                : 'border-gray-300 hover:border-[#9747FF]'}`}
                                    >
                                        <input {...getInputProps()} />
                                        {preview ? (
                                            <div className="relative aspect-[16/9] w-full">
                                                <Image
                                                    src={preview}
                                                    alt="Banner preview"
                                                    fill
                                                    className="object-contain rounded-lg"
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreview(null);
                                                    }}
                                                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-[#9747FF]">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                                </svg>
                                                <div>
                                                    <p className="text-base font-medium text-gray-900">
                                                        Drop your image here, or <span className="text-[#9747FF]">browse</span>
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Support for JPG, PNG and GIF files
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none transition-colors duration-200"
                                        onClick={onClose}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                        style={{
                                            background: 'linear-gradient(rgb(151, 71, 255) 0%, rgba(91, 43, 153, 0.91) 100%)'
                                        }}
                                        onClick={handleSubmit}
                                        disabled={!preview || isLoading}
                                    >
                                        {isLoading ? 'Uploading...' : banner ? 'Update Banner' : 'Upload Banner'}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
} 