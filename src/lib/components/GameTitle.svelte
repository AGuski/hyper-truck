<script lang="ts">
    import { deviceInfo } from "$lib/stores/device-store";

  // GameTitle.svelte - ASCII art title component for HYPER TRUCK
</script>

<pre class="ascii-title text-center mt-16 mb-6 text-transparent bg-clip-text gradient-text">
<div class:mobile-title={$deviceInfo.isMobile}>
  ██╗  ██╗██╗   ██╗██████╗ ███████╗██████╗     ████████╗██████╗ ██╗   ██╗ ██████╗██╗  ██╗
  ██║  ██║╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗    ╚══██╔══╝██╔══██╗██║   ██║██╔════╝██║ ██╔╝
  ███████║ ╚████╔╝ ██████╔╝█████╗  ██████╔╝       ██║   ██████╔╝██║   ██║██║     █████╔╝ 
  ██╔══██║  ╚██╔╝  ██╔═══╝ ██╔══╝  ██╔══██╗       ██║   ██╔══██╗██║   ██║██║     ██╔═██╗ 
  ██║  ██║   ██║   ██║     ███████╗██║  ██║       ██║   ██║  ██║╚██████╔╝╚██████╗██║  ██╗
  ╚═╝  ╚═╝   ╚═╝   ╚═╝     ╚══════╝╚═╝  ╚═╝       ╚═╝   ╚═╝  ╚═╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝
</div>
                                                                                   
 🔥🔥🔥 THE PHYSICS-DEFYING DRIVING EXPERIENCE 🔥🔥🔥
   <a href="https://github.com/AGuski/hyper-truck" target="_blank" rel="noopener noreferrer" class="github-link flex items-center justify-center transition-all">
     <svg class="w-5 h-5 mr-3" fill="#3b82f6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
       <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
     </svg>
     <span class="gradient-text font-bold">Visit on GitHub</span>
   </a>
   </pre>

<style>

  /* Gradient text for ASCII art title */
  :global(.gradient-text) {
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  
  /* Gradient fill for SVG icons */
  :global(.gradient-fill) {
    fill: url(#gradient);
  }
  
  /* ASCII art title styling */
  .ascii-title {
    font-family: monospace;
    font-size: 0.6rem;
    line-height: 1.2;
    white-space: pre;
    text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
    font-weight: bold;
  }
  
  /* GitHub link styles */
  .github-link {
    position: relative;
    transition: var(--transition-fast);
  }

  .github-link:hover {
    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.8));
    transform: scale(1.05);
  }

  .github-link:hover svg {
    filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.8));
  }

  .github-link:hover span {
    text-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
  }

  .ascii-title {
    font-family: monospace;
    font-size: 0.6rem;
    line-height: 1.2;
    white-space: pre;
    user-select: none;
  }
  
  @media (min-width: 640px) {
    .ascii-title {
      font-size: 0.7rem;
    }
  }
  
  @media (min-width: 768px) {
    .ascii-title {
      font-size: 0.8rem;
    }
  }

  .mobile-title {
    font-size: 0.6rem;
  }
</style>
